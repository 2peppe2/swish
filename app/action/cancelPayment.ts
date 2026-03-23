"use server";

import { PaymentStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import swish from "@/lib/swish";
import { isSwishError } from "@/lib/swishPaymentHandler";
import { isTerminalStatus } from "@/lib/utils";
import log from "@/lib/logger";
const syncTerminalSwishStatus = async (
  paymentId: string,
  previousStatus: PaymentStatus,
  reference: string,
  status: PaymentStatus,
  datePaid: string | null,
  paymentReference: string | null,
) => {
  const updatedPayment = await prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status,
      paid_at: status === PaymentStatus.PAID && datePaid ? new Date(datePaid) : null,
      payment_reference: status === PaymentStatus.PAID ? paymentReference  : null,
    },
  });

  if (previousStatus !== updatedPayment.status) {
    notifyStatusUpdate({
      type: "status-update",
      id: updatedPayment.id,
      reference,
      status: updatedPayment.status,
    });
  }

  return updatedPayment;
};

const cancelPayment = async (reference: string, isCreated = true) => {
  log("INFO", "CancelPayment", `Attempting to cancel payment with reference ${reference}`);
  const payment = await prisma.payment.findUnique({
    where: {
      payee_payment_reference: reference,
    },
  });
  if (!payment) {
    throw new Error(`Payment with reference ${reference} not found`);
  }
  if (isCreated) {
    const swishPayment = await swish.retrievePaymentRequest(payment.id);
    if (isSwishError(swishPayment)) {
      log("ERROR", "CancelPayment", `Failed to retrieve payment from Swish for reference ${reference}: ${swishPayment.message}`);
      throw new Error(`Failed to retrieve payment: ${swishPayment.message}`);
    }
    if (isTerminalStatus(swishPayment.status)) {
      log("INFO", "CancelPayment", `Payment with reference ${reference} is already in terminal status ${swishPayment.status}, syncing status without attempting cancellation`);
      return syncTerminalSwishStatus(
        payment.id,
        payment.status,
        payment.payee_payment_reference,
        swishPayment.status,
        swishPayment.datePaid,
        swishPayment.paymentReference,
      );
    }
    const swishPaymentResponse = await swish.cancelPaymentRequest(payment.id);
    if (isSwishError(swishPaymentResponse)) {
      log("ERROR", "CancelPayment", `Failed to cancel payment with reference ${reference}: ${swishPaymentResponse.message}`);
      throw new Error(`Failed to cancel payment: ${swishPaymentResponse.message}`);
    }

    if (swishPaymentResponse.status !== "CANCELLED") {
      log("ERROR", "CancelPayment", `Unexpected status after cancellation attempt for reference ${reference}: ${swishPaymentResponse.status}`);
      throw new Error("Payment was not cancelled");
    }
  }

  const cancelledPayment = await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  log("INFO", "CancelPayment", `Payment with reference ${reference} cancelled successfully in database`);

  if (payment.status !== cancelledPayment.status) {
    notifyStatusUpdate({
      type: "status-update",
      id: cancelledPayment.id,
      reference: cancelledPayment.payee_payment_reference,
      status: cancelledPayment.status,
    });
  }

  return cancelledPayment;
};

export { cancelPayment };

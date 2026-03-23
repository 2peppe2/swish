import "server-only";

import { PaymentStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import { PAYMENT_TIMEOUT_MS } from "@/lib/paymentTimeoutConfig";
import { isTerminalStatus } from "@/lib/utils";

const expirePaymentIfTimedOut = async (reference: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      payee_payment_reference: reference,
    },
    select: {
      id: true,
      payee_payment_reference: true,
      status: true,
      updated_at: true,
    },
  });

  if (!payment) {
    throw new Error(`Payment with reference ${reference} not found`);
  }

  if (isTerminalStatus(payment.status)) {
    return payment.status;
  }

  const expiresAt = payment.updated_at.getTime() + PAYMENT_TIMEOUT_MS;
  if (Date.now() < expiresAt) {
    return payment.status;
  }

  const updateResult = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      updated_at: payment.updated_at,
      status: {
        in: [PaymentStatus.INITIATED, PaymentStatus.CREATED],
      },
    },
    data: {
      status: PaymentStatus.CANCELLED,
    },
  });

  if (updateResult.count > 0) {
    notifyStatusUpdate({
      type: "status-update",
      id: payment.id,
      reference: payment.payee_payment_reference,
      status: PaymentStatus.CANCELLED,
    });

    return PaymentStatus.CANCELLED;
  }

  const latestPayment = await prisma.payment.findUnique({
    where: {
      payee_payment_reference: reference,
    },
    select: {
      status: true,
    },
  });

  if (!latestPayment) {
    throw new Error(`Payment with reference ${reference} not found`);
  }

  return latestPayment.status;
};

const getPaymentTimeoutRemainingMs = async (reference: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      payee_payment_reference: reference,
    },
    select: {
      status: true,
      updated_at: true,
    },
  });

  if (!payment || isTerminalStatus(payment.status)) {
    return null;
  }

  return Math.max(
    0,
    payment.updated_at.getTime() + PAYMENT_TIMEOUT_MS - Date.now(),
  );
};

export { expirePaymentIfTimedOut, getPaymentTimeoutRemainingMs };

"use server";

import { PaymentStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { generateUUID } from "@/lib/uuid";
import log from "@/lib/logger";

const retrieveExternalPayment = async (reference: string) => {
  if (!reference) {
    log("ERROR", "GetExternalPayment", "Payment reference is required");
    throw new Error("Payment reference is required");
  }

  // Check if the payment exists in the database
  const payment = await prisma.payment.findUnique({
    where: {
      payee_payment_reference: reference,
    },
  });
  if (payment) {
    return payment;
  }
  //TODO remove when external API is ready, this is just to be able to test the flow without the external API being implemented
  return await temporaryPayment(reference);

  /*const paymentData = await fetchExternalPayment(reference);
  if (isExternalPaymentError(paymentData)) {
    if (paymentData.error === "Payment not found") {
      log("WARN", "GetExternalPayment", `Payment with reference ${reference} not found in external system`);
      return null;
    }
    log("ERROR", "GetExternalPayment", `Failed to fetch payment data for reference ${reference} from external system: ${paymentData.error}`);
    throw new Error(paymentData.error);
  }

  const payee_alias = process.env.SWISH_PAYEE_ALIAS;
  if (!payee_alias) {
    log("ERROR", "GetExternalPayment", "Payee alias is not configured in environment variables");
    throw new Error("Payee alias is not configured");
  }
  
  log("INFO", "GetExternalPayment", `Fetched payment data for reference ${reference} from external system, saving to database with payee alias ${payee_alias} and amount ${paymentData.amount}`);
  
  const savedPayment = await prisma.payment.upsert({
    where: {
      payee_payment_reference: reference,
    },
    update: {
      payer_alias: paymentData.payer_alias,
      amount: paymentData.amount,
      redirect_url_on_payment: paymentData.redirect_url,
      message: paymentData.message,
    },
    create: {
      id: generateUUID(),
      payee_payment_reference: reference,
      payee_alias: payee_alias,
      payer_alias: paymentData.payer_alias,
      amount: paymentData.amount,
      redirect_url_on_payment: paymentData.redirect_url,
      status: PaymentStatus.INITIATED,
      message: paymentData.message,
    },
  });

  return savedPayment;*/
};

const temporaryPayment = async (ref: string) => {
  const newPayment = await prisma.payment.create({
    data: {
      id: generateUUID(),
      payee_payment_reference: ref,
      payee_alias: "1231181189",
      amount: 100,
      status: PaymentStatus.INITIATED,
      message: "Test payment",
      redirect_url_on_payment: "https://example.com/redirect",
    },
  });

  log("INFO", "GetExternalPayment", `Created temporary payment with reference ${ref} for testing purposes`);

  return newPayment;
}

export { retrieveExternalPayment as getExternalPayment };

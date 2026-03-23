"use server";

import { PaymentStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { generateUUID } from "@/lib/uuid";


const retrieveExternalPayment = async (reference: string) => {
  if (!reference) {
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
      return null;
    }

    throw new Error(paymentData.error);
  }

  const payee_alias = process.env.SWISH_PAYEE_ALIAS;
  if (!payee_alias) {
    throw new Error("Payee alias is not configured");
  }
  

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

  return newPayment;
}

export { retrieveExternalPayment as getExternalPayment };

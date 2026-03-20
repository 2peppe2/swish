"use server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { generateUUID } from "@/lib/uuid";

const getExternalPayment = async (reference: string) => {
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
  // TODO: Remove temporary payment creation and replace it with the actual fetch from the external API
  return temporaryPayment(reference);

  // If the payment fetch from the external API and save it to the database
  const externalApiUrl = process.env.EXTERNAL_API_URL;
  const response = await fetch(`${externalApiUrl}/${reference}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch payment from external API: ${response.statusText}`,
    );
  }
  const paymentData = await response.json();
  const savedPayment = await prisma.payment.create({
    data: {
      id: generateUUID(),
      payee_payment_reference: paymentData.payee_payment_reference,
      payee_alias: paymentData.payee_alias,
      amount: paymentData.amount,
      redirect_url_on_payment: paymentData.redirect_url_on_payment,
      status: PaymentStatus.PROCESSING,
      message: paymentData.message,
    },
  });
  return savedPayment;
};

export { getExternalPayment };

const temporaryPayment = async (ref: string) => {
  const newPayment = await prisma.payment.create({
    data: {
      id: generateUUID(),
      payee_payment_reference: ref,
      payee_alias: "1231892116",
      amount: 100.1,
      redirect_url_on_payment: "https://example.com",
      status: PaymentStatus.INITIATED,
      message: "Test payment",
    },
  });
  return newPayment;
};





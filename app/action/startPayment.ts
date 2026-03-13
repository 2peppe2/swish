"use server";
import prisma from "@/lib/prisma";
import swish from "@/lib/swish";
import { isSwishError } from "@/lib/swishPaymentHandler";

interface StartPaymentProps {
  reference: string;
  payerAlias: string;
}

const startPayment = async ({ reference, payerAlias }: StartPaymentProps) => {
  const payment = await prisma.payment.update({
    where: {
      payee_payment_reference: reference,
    },
    data: {
      payer_alias: payerAlias,
    }
  });
  if (!payment) {
    throw new Error(`Payment with reference ${reference} not found`);
  }

  const request = await swish.createPaymentRequest(
        {
            id: payment.id,
            payeePaymentReference: reference,
            payerAlias: payerAlias,
            amount: payment.amount.toString(),
            message: payment.message,
        },
    );

  if (isSwishError(request)) {
    return "Error creating payment request: " + request.message;
  }
  console.log("Payment request created successfully:", request);


  return request;
};

export { startPayment };

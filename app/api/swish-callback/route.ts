import { SwishPaymentResponse } from "./types";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {

  const body = (await request.json()) as SwishPaymentResponse;
  const {
    id,
    paymentReference,
    payerAlias,
    payeeAlias,
    status,
    errorCode,
    errorMessage,
  } = body;

  //TODO: add error handling for when the payment is not found in the database
  //TODO: add error handling for when the payment is cancelled or declined

  await prisma.payment.update({
    where: {
      id,
    },
    data: {
      payment_reference: paymentReference,
      payer_alias: payerAlias,
      payee_alias: payeeAlias,
      status,
      paid_at: new Date(),
    },
  });

  //TODO: call the external source to update the payment status there as well

  return new Response(null, {
    status: 200,
  });
}

import { SwishPaymentResponse } from "./types";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";

export async function POST(request: Request) {
  const body = (await request.json()) as SwishPaymentResponse;
  const {
    id,
    payeePaymentReference,
    paymentReference,
    payerAlias,
    payeeAlias,
    status,
    datePaid,
  } = body;

  const existingPayment = await prisma.payment.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
    },
  });

  if (!existingPayment) {
    return new Response("Payment not found", {
      status: 404,
    });
  }

  const hasStatusChanged = existingPayment.status !== status;

  await prisma.payment.update({
    where: {
      id,
    },
    data: {
      payment_reference: paymentReference,
      payer_alias: payerAlias,
      payee_alias: payeeAlias,
      status,
      paid_at: status === "PAID" && datePaid ? new Date(datePaid) : null,
    },
  });

  if (hasStatusChanged) {
    notifyStatusUpdate({
      type: "status-update",
      id,
      reference: payeePaymentReference,
      status,
    });
  }

  //TODO: call the external source to update the payment status there as well

  return new Response(null, {
    status: 200,
  });
}

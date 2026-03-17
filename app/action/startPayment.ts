"use server";
import prisma from "@/lib/prisma";
import swish from "@/lib/swish";
import { isSwishError } from "@/lib/swishPaymentHandler";

interface StartPaymentProps {
  reference: string;
  payerAlias: string;
}

type StartPaymentResult =
  | { ok: true }
  | { ok: false; error: string };

const startPayment = async ({ reference, payerAlias }: StartPaymentProps) => {
  try {
    const payment = await prisma.payment.update({
      where: {
        payee_payment_reference: reference,
      },
      data: {
        payer_alias: payerAlias,
      },
    });

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
      return { ok: false, error: request.message } satisfies StartPaymentResult;
    }

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "PROCESSING",
      },
    });

    return { ok: true } satisfies StartPaymentResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kunde inte starta betalningen.";
    return { ok: false, error: message } satisfies StartPaymentResult;
  }
};

export { startPayment };

"use server";
import prisma from "@/lib/prisma";
import swish from "@/lib/swish";
import { isSwishError } from "@/lib/swishPaymentHandler";
import log from "@/lib/logger";

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
    log("INFO", "StartPayment",`Attempting to start payment for reference ${reference} with payer alias ${payerAlias}`);
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
      log("ERROR", "StartPayment", `Failed to create payment request for reference ${reference}: ${request.message}`);
      return { ok: false, error: request.message } satisfies StartPaymentResult;
    }

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "CREATED",
      },
    });
    log("INFO", "StartPayment", `Payment request created successfully for reference ${reference}, payment status updated to CREATED`);
    return { ok: true } satisfies StartPaymentResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kunde inte starta betalningen.";
    log("ERROR", "StartPayment", `Failed to start payment for reference ${reference}: ${message}`);
    return { ok: false, error: message } satisfies StartPaymentResult;
  }
};

export { startPayment };

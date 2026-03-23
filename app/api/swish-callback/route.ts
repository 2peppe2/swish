import { updateExternalPayment } from "@/lib/externalHandler";
import { SwishPaymentResponse } from "./types";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import { NextResponse, NextRequest } from "next/server";

const ALLOWED_IPS = ["89.46.83.171"];


export async function POST(request: NextRequest) {

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim();

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

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

  const response = await updateExternalPayment(payeePaymentReference, status);
  if (!response.success) {
    console.error(`Failed to update external payment status: ${response.error}`);
  }
  
  return new Response(null, {
    status: 200,
  });
}

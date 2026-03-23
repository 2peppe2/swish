import { updateExternalPayment } from "@/lib/externalHandler";
import { SwishPaymentResponse } from "./types";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import { NextResponse, NextRequest } from "next/server";
import log from "@/lib/logger";

const ALLOWED_IPS = ["89.46.83.171"];


export async function POST(request: NextRequest) {

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim();

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    log("WARN", "Callback", `Received callback from unauthorized IP: ${ip}`);
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

  log("INFO", "Callback", `Received callback for payment reference ${payeePaymentReference} with status ${status}`);

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
    log("INFO", "Callback", `Payment status updated for reference ${payeePaymentReference} to ${status}`);
    notifyStatusUpdate({
      type: "status-update",
      id,
      reference: payeePaymentReference,
      status,
    });
  }

  const response = await updateExternalPayment(payeePaymentReference, status);
  if (!response.success) {
    log("ERROR", "Callback", `Failed to update external payment status for reference ${payeePaymentReference}: ${response.error}, with payment status ${status}`);
  }
  log("INFO", "Callback", `External payment status update result for reference ${payeePaymentReference}: ${response.success ? "success" : "failure"}, with payment status ${status}`);
  return new Response(null, {
    status: 200,
  });
}

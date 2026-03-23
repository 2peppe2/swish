import { updateExternalPayment } from "@/lib/externalHandler";
import { SwishPaymentResponse } from "./types";
import prisma from "@/lib/prisma";
import { notifyStatusUpdate } from "@/lib/sse";
import { NextResponse, NextRequest } from "next/server";
import log from "@/lib/logger";

const ALLOWED_IP_RANGES = [
  "89.46.83.0/24",
  "103.57.74.0/24",
  "77.81.6.112",
];

const ipv4ToNumber = (ip: string) => {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }

  let result = 0;
  for (const part of parts) {
    const value = Number(part);
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      return null;
    }

    result = (result << 8) + value;
  }

  return result >>> 0;
};

const isIpAllowed = (ip: string) => {
  const ipNumber = ipv4ToNumber(ip);
  if (ipNumber === null) {
    return false;
  }

  return ALLOWED_IP_RANGES.some((entry) => {
    if (!entry.includes("/")) {
      return entry === ip;
    }

    const [network, prefixLengthValue] = entry.split("/");
    const networkNumber = ipv4ToNumber(network);
    const prefixLength = Number(prefixLengthValue);

    if (
      networkNumber === null ||
      !Number.isInteger(prefixLength) ||
      prefixLength < 0 ||
      prefixLength > 32
    ) {
      return false;
    }

    const mask =
      prefixLength === 0 ? 0 : ((0xffffffff << (32 - prefixLength)) >>> 0);

    return (ipNumber & mask) === (networkNumber & mask);
  });
};


export async function POST(request: NextRequest) {

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim();

  if (!ip || !isIpAllowed(ip)) {
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

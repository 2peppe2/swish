import { expirePaymentIfTimedOut } from "@/lib/paymentExpiry";

interface PaymentStatusRouteProps {
  params: Promise<{ ref: string }>;
}

export async function GET(_request: Request, { params }: PaymentStatusRouteProps) {
  const { ref } = await params;
  const status = await expirePaymentIfTimedOut(ref);

  return Response.json({ status });
}

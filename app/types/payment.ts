import { Prisma } from "../generated/prisma/client";

type Payment = Prisma.PaymentGetPayload<{
  select: {
    id: true;
    payee_payment_reference: true;
    payee_alias: true;
    amount: true;
    redirect_url_on_payment: true;
    status: true;
    message: true;
  };
}>;



export type { Payment };
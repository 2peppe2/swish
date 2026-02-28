import prisma from "@/lib/prisma";

export default async function Home() {
  await prisma.payment.create({
    data: {
      payee_payment_reference: "Test payment",
      payee_alias: "0705472993",
      amount: 100,
      redirect_url_on_payment: "https://example.com/redirect",
    },
  });
  return "HEJ";
}

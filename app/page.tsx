import prisma from "@/lib/prisma";

export default async function Home() {
  await prisma.payment.create({
    data: {
      id: "1234567890",
      payee_payment_reference: "Test payment",
      payee_alias: "0705472993",
      currency: "SEK",
      status: "CREATED",
      amount: 100,
      created_at: new Date(),
      redirect_callback_url: "https://example.com/redirect",
    },
  });
  return "HEJ";
}

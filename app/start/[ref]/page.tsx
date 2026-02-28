import { cancelPayment } from "@/app/action/cancelpayment";
import { getExternalPayment } from "@/app/action/external";
import { startPayment } from "@/app/action/startPayment";
import { FC } from "react";

interface StartPageProps {
  params: Promise<{ ref: string }>;
}

const StartPage: FC<StartPageProps> = async ({ params }) => {
  const { ref } = await params;
    const payment = await getExternalPayment(ref)
    const swishPayment = await startPayment({
        reference: payment.payee_payment_reference,
        payerAlias: "0705472993",
    })
    console.log(`Started payment: ${JSON.stringify(swishPayment)}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const cancelledPayment = await cancelPayment(payment.payee_payment_reference);
    console.log(`Cancelled payment: ${JSON.stringify(cancelledPayment)}`);

  return (
    <main>
      <div>{ref}</div>
    </main>
  );
};

export default StartPage;

import { getExternalPayment } from "@/app/action/external";
import WaitingClientPage from "./WaitingClientPage";

interface WaitingPageProps {
  params: Promise<{ ref: string }>;
}

const WaitingPage = async ({ params }: WaitingPageProps) => {
  const { ref } = await params;
  const payment = await getExternalPayment(ref);

  return (
    <main>
      <WaitingClientPage
        reference={ref}
        initialStatus={payment.status}
        redirectUrl={payment.redirect_url_on_payment}
      />
    </main>
  );
};

export default WaitingPage;

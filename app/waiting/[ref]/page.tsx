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
        startedAt={payment.updated_at.toISOString()}
      />
    </main>
  );
};

export default WaitingPage;

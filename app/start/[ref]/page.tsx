import { getExternalPayment } from "@/app/action/external";
import StartClientPage from "./StartClientPage";

interface StartPageProps {
  params: { ref: string };
}

const StartPage = async ({ params }: StartPageProps) => {
  const { ref } = await params; // Has to be awaited to be used in getExternalPayment, otherwise it will be undefined
  const payment = await getExternalPayment(ref);

  return (
    <main>
      <StartClientPage payment={payment} />
    </main>
  );
};

export default StartPage;

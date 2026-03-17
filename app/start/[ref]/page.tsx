import { getExternalPayment } from "@/app/action/external";
import StartClientPage from "./StartClientPage";
import { isTerminalStatus } from "@/lib/utils";
import { redirect } from "next/navigation";

interface StartPageProps {
  params: { ref: string };
}

const StartPage = async ({ params }: StartPageProps) => {
  const { ref } = await params; // Has to be awaited to be used in getExternalPayment, otherwise it will be undefined
  const payment = await getExternalPayment(ref);
  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg bg-card p-8 shadow-lg">
          <h1 className="text-2xl font-semibold">Betalning hittades inte</h1>
          <p className="mt-4 text-muted-foreground">
            Det gick inte att hitta betalningen. Kontrollera att du har använt rätt länk.
          </p>
        </div>
      </div>
    );
  }
  if (isTerminalStatus(payment.status)) {
    redirect(`/status/${ref}`);
  }
  if (payment.status === "PROCESSING") {
    redirect(`/waiting/${ref}`);
  }

  return (
    <main>
      <StartClientPage payment={payment} />
    </main>
  );
};

export default StartPage;

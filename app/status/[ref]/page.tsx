import { getExternalPayment } from "@/app/action/external";
import { Card, CardContent } from "@/components/ui/card";
import StatusDetails from "./components/StatusDetails";
import StatusHero from "./components/StatusHero";
import { statusContent } from "./components/statusContent";
import { isTerminalStatus } from "@/lib/utils";
import { redirect } from "next/navigation";

interface StatusPageProps {
  params: Promise<{ ref: string }>;
}

const formatDateTime = (value: Date | null) => {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

const StatusPage = async ({ params }: StatusPageProps) => {
  const { ref } = await params;
  const payment = await getExternalPayment(ref);
  if (!payment) {
     redirect(`/start/${ref}`);
  }

  if(!isTerminalStatus(payment.status)) {
    if (payment.status === "INITIATED") {
      redirect(`/start/${ref}`);
    } else {
      redirect(`/waiting/${ref}`);
    }
  }
  
  const content = statusContent[payment.status]
  const isPaid = payment.status === "PAID";
  const smallDate = formatDateTime(payment.paid_at ?? payment.updated_at);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl dark:bg-secondary/20" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center">
        <Card
          className={`w-full overflow-hidden border border-border/80 bg-card/90 py-0 shadow-lg backdrop-blur ${content.cardTone}`}
        >
          <StatusHero content={content} />

          <CardContent className="px-6 py-8 sm:px-8 sm:py-10">
            <StatusDetails
              buttonLabel={content.primaryActionLabel}
              callbackURL={payment.redirect_url_on_payment}
              isPaid={isPaid}
              message={payment.message}
              smallDate={smallDate}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default StatusPage;

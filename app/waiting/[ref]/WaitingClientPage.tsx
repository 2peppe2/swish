"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStatus } from "@/app/action/getStatus";
import { cancelPayment } from "@/app/action/cancelPayment";
import { PaymentStatus } from "@/app/generated/prisma/enums";
import WaitingActions from "./components/WaitingActions";
import WaitingMetaInfo from "./components/WaitingMetaInfo";
import WaitingStatusPanel from "./components/WaitingStatusPanel";
import { useRouter } from "next/navigation";
import { isTerminalStatus } from "@/lib/utils";

interface WaitingClientPageProps {
  reference: string;
  initialStatus: PaymentStatus;
  redirectUrl: string;
}

const POLL_INTERVAL_MS = 1000;

const WaitingClientPage = ({
  reference,
  initialStatus,
  redirectUrl,
}: WaitingClientPageProps) => {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [isCancelling, setIsCancelling] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const router = useRouter();



  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
      navigator.userAgent || "",
    );

  useEffect(() => {
    if (isTerminalStatus(status)) {
      router.push("/status/" + reference);
    }
  }, [status, redirectUrl, router, reference]);


  // Polling for status updates
  useEffect(() => {
    if (isTerminalStatus(status)) {
      return;
    }

    let active = true;

    const pollStatus = async () => {
      try {
        const nextStatus = await getStatus(reference);
        if (!active) return;
        setStatus(nextStatus);
        setRequestError(null);
      } catch {
        if (!active) return;
        setRequestError("Kunde inte hämta betalningsstatus just nu.");
      }
    };

    void pollStatus();

    const pollingTimer = setInterval(() => {
      void pollStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(pollingTimer);
    };
  }, [reference, status]);


  const canCancel = !isCancelling && !isTerminalStatus(status);

  const handleCancel = async () => {
    if (!canCancel) return;

    setIsCancelling(true);
    setRequestError(null);

    try {
      const canceledPayment = await cancelPayment(reference);
      if (canceledPayment.status === "CANCELLED") {
        router.push("/status/" + reference);
      }
    } catch {
      setRequestError("Kunde inte avbryta betalningen just nu.");
    } 
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl dark:bg-secondary/20" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Card className="border-border/80 bg-card/90 shadow-lg backdrop-blur">
          <CardHeader className="gap-3">
            <CardTitle className="text-2xl">
              Väntar på betalning i Swish
            </CardTitle>
            <CardDescription>
              Den här sidan fortsätter automatiskt när transaktionen är klar i
              Swish-appen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WaitingStatusPanel />
            <WaitingActions
              shouldShowOpenSwishButton={isMobile}
              canCancel={canCancel}
              isCancelling={isCancelling}
              onCancel={() => void handleCancel()}
            />
            <WaitingMetaInfo
              reference={reference}
              requestError={requestError}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaitingClientPage;

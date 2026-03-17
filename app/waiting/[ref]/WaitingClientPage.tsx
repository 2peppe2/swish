"use client";

import { useEffect, useRef, useState } from "react";
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
import type { StatusStreamEvent } from "@/lib/sse";

interface WaitingClientPageProps {
  reference: string;
  initialStatus: PaymentStatus;
  startedAt: string;
}

const PAYMENT_TIMEOUT_MS = 3 * 60 * 1000;

const getRemainingSeconds = (startedAt: string) =>
  Math.max(
    0,
    Math.ceil(
      (new Date(startedAt).getTime() + PAYMENT_TIMEOUT_MS - Date.now()) / 1000,
    ),
  );

const WaitingClientPage = ({
  reference,
  initialStatus,
  startedAt,
}: WaitingClientPageProps) => {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [isCancelling, setIsCancelling] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(startedAt),
  );
  const eventSourceRef = useRef<EventSource | null>(null);
  const router = useRouter();

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
      navigator.userAgent || "",
    );

  useEffect(() => {
    if (isTerminalStatus(status)) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      router.push("/status/" + reference);
    }
  }, [status, router, reference]);

  useEffect(() => {
    let active = true;

    const refreshStatus = async () => {
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

    if (isTerminalStatus(initialStatus)) {
      return () => {
        active = false;
      };
    }

    const eventSource = new EventSource(
      `/api/status-stream?reference=${encodeURIComponent(reference)}`,
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as StatusStreamEvent;
      if (data.type !== "status-update") {
        return;
      }

      setRequestError(null);
      setStatus(data.status);

      if (isTerminalStatus(data.status)) {
        eventSource.close();
        eventSourceRef.current = null;
      }
    };

    eventSource.onerror = () => {
      if (!active || eventSourceRef.current !== eventSource) {
        return;
      }

      setRequestError("Kunde inte lyssna efter statusuppdateringar just nu.");
    };

    void refreshStatus();

    return () => {
      active = false;
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };
  }, [reference, initialStatus]);

  useEffect(() => {
    if (isTerminalStatus(status)) {
      return;
    }

    setRemainingSeconds(getRemainingSeconds(startedAt));

    const countdownTimer = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(startedAt));
    }, 1000);

    return () => {
      window.clearInterval(countdownTimer);
    };
  }, [startedAt, status]);

  const canCancel = !isCancelling && !isTerminalStatus(status);

  const handleCancel = async () => {
    if (!canCancel) return;

    setIsCancelling(true);
    setRequestError(null);

    try {
      const canceledPayment = await cancelPayment(reference);
      if (canceledPayment.status === "CANCELLED") {
        setStatus(canceledPayment.status);
        router.push("/status/" + reference);
      }
    } catch {
      setRequestError("Kunde inte avbryta betalningen just nu.");
    } finally {
      setIsCancelling(false);
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
            <WaitingStatusPanel remainingSeconds={remainingSeconds} />
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

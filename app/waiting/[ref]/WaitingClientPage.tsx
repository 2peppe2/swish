"use client";

import { useEffect, useRef, useState } from "react";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cancelPayment } from "@/app/action/cancelPayment";
import { PaymentStatus } from "@/app/generated/prisma/enums";
import WaitingActions from "./components/WaitingActions";
import WaitingMetaInfo from "./components/WaitingMetaInfo";
import WaitingStatusPanel from "./components/WaitingStatusPanel";
import { PAYMENT_TIMEOUT_MS } from "@/lib/paymentTimeoutConfig";
import { useRouter } from "next/navigation";
import { isTerminalStatus } from "@/lib/utils";
import type { StatusStreamEvent } from "@/lib/sse";
import { runWithViewTransition } from "@/lib/viewTransition";

interface WaitingClientPageProps {
  reference: string;
  initialStatus: PaymentStatus;
  startedAt: string;
}

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
      runWithViewTransition(() => {
        router.push("/status/" + reference);
      });
    }
  }, [status, router, reference]);

  useEffect(() => {
    let active = true;

    const refreshStatus = async () => {
      try {
        const response = await fetch(
          `/api/payment-status/${encodeURIComponent(reference)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment status");
        }

        const data = (await response.json()) as { status: PaymentStatus };
        const nextStatus = data.status;
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

      void refreshStatus();
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
      setStatus(canceledPayment.status);
    } catch {
      setRequestError("Kunde inte avbryta betalningen just nu.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Card className="payment-flow-card border-border/80 bg-card/90 shadow-lg backdrop-blur">
          <CardHeader className="gap-3">
            <Badge
              variant="outline"
              className="border-border/80 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Väntar
            </Badge>
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

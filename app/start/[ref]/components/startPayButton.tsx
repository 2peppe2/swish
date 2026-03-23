"use client";

import { startPayment } from "@/app/action/startPayment";
import { Button } from "@/components/ui/button";
import { runWithViewTransition } from "@/lib/viewTransition";
import { FC, useState } from "react";
import { useRouter } from "next/navigation";

interface StartPayButtonProps {
  canSubmit: boolean;
  reference: string;
  phoneNumber: string;
}

const StartPayButton: FC<StartPayButtonProps> = ({ canSubmit, reference, phoneNumber}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayClick = async () => {
    if (!canSubmit || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await startPayment({ reference, payerAlias: phoneNumber });

      if (!result.ok) {
        console.error("Payment failed:", result.error);
        return;
      }

      runWithViewTransition(() => {
        router.push(`/waiting/${reference}`);
      });
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="h-12 w-full text-base font-semibold"
      disabled={!canSubmit || isLoading}
      onClick={handlePayClick}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Laddar...
        </div>
      ) : (
        "Betala"
      )}
    </Button>
  );
};

export default StartPayButton;

"use client";

import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentInfoDialog from "./PaymentInfoDialog";

const StartCardHeader = () => {
  return (
    <CardHeader className="gap-4 pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-border/80 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Start
          </Badge>
          <div>
            <CardTitle className="text-2xl">Betala med Swish</CardTitle>
            <CardDescription className="mt-1 text-base text-muted-foreground">
              Ange ditt mobilnummer för att starta betalningen.
            </CardDescription>
          </div>
        </div>
        <PaymentInfoDialog />
      </div>
    </CardHeader>
  );
};

export default StartCardHeader;

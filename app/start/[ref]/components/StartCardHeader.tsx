"use client";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentInfoDialog from "./PaymentInfoDialog";


const StartCardHeader = () => {
  return (
    <CardHeader className="gap-4 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Betala med Swish</CardTitle>
            <CardDescription className="mt-1 text-base text-muted-foreground">
              Ange ditt mobilnummer för att starta betalningen.
            </CardDescription>
          </div>
          <PaymentInfoDialog />
        </div>
      </CardHeader>
  );
};

export default StartCardHeader;

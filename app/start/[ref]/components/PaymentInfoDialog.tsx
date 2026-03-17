"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const PaymentInfoDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Hjälp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Swish-betalning</DialogTitle>
          <DialogDescription>
            Vägledning för att slutföra din betalning snabbt och säkert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Så fungerar det</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">1. Starta betalningen:</span>{" "}
                  Ange ditt mobilnummer och tryck på betala.
                </li>
                <li>
                  <span className="font-medium text-foreground">2. Öppna Swish-appen:</span>{" "}
                  Bekräfta förfrågan som visas där.
                </li>
                <li>
                  <span className="font-medium text-foreground">3. Klart:</span>{" "}
                  När betalningen är godkänd fortsätter sidan automatiskt.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vanliga problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  Jag fick ingen avisering i Swish-appen
                </p>
                <p className="text-muted-foreground">
                  Kontrollera mobilnumret och öppna Swish manuellt för att se väntande förfrågningar.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Betalningen misslyckades eller avvisades
                </p>
                <p className="text-muted-foreground">
                  Försök igen eller kontakta din bank om betalningen blockeras.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div>
                <p className="font-medium text-foreground">Behöver du mer hjälp?</p>
                <p className="text-sm text-muted-foreground">
                  Kontakta support via{" "}
                  <a
                    href="mailto:developer@ltison.se"
                    className="font-medium text-foreground underline underline-offset-2"
                  >
                    developer@ltison.se
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentInfoDialog;

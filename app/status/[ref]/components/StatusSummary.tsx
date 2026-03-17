import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formattedAmount } from "@/lib/utils";

interface StatusSummaryProps {
  amount: number;
  reference: string;
  status: string;
  message: string;
  paidAt: string | null;
}

const StatusSummary = ({
  amount,
  reference,
  status,
  message,
  paidAt,
}: StatusSummaryProps) => {
  return (
    <Card className="overflow-hidden border-border/70 bg-muted/30 py-0 shadow-none">
      <CardHeader className="gap-2 border-b border-border/70 bg-background/55 px-5 py-5">
        <CardTitle className="text-base">Betalningsöversikt</CardTitle>
        <CardDescription>
          Referens och senaste registrerade uppgifter.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 py-5">
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Belopp
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formattedAmount(amount)}
          </p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Referens
            </p>
            <p className="mt-1 font-medium">{reference}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </p>
            <p className="mt-1 font-medium">{status}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Meddelande
            </p>
            <p className="mt-1 font-medium">{message}</p>
          </div>

          {paidAt ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Betald
              </p>
              <p className="mt-1 font-medium">{paidAt}</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSummary;

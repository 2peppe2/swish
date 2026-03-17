import { Badge } from "@/components/ui/badge";

interface WaitingStatusPanelProps {
  remainingSeconds: number;
}

const formatRemainingTime = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const WaitingStatusPanel = ({ remainingSeconds }: WaitingStatusPanelProps) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/80 bg-muted/40 px-5 py-6">
      <p className="text-center text-sm text-muted-foreground">
        Slutför betalningen i Swish-appen.
      </p>
      <div className="flex flex-col items-center gap-2">
        <Badge
          variant="outline"
          className="border-border/80 bg-background/80 px-3.5 py-1.5 text-xs text-muted-foreground"
        >
          Sidan uppdateras automatiskt
        </Badge>
        <p className="text-xs text-muted-foreground">
          {remainingSeconds > 0
            ? `Förfrågan upphör om ${formatRemainingTime(remainingSeconds)}`
            : "Förfrågan har gått ut"}
        </p>
      </div>
    </div>
  );
};

export default WaitingStatusPanel;

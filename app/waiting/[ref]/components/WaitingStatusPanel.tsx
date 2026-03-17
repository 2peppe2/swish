import { Badge } from "@/components/ui/badge";

const WaitingStatusPanel = () => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/80 bg-muted/40 px-5 py-6">
      <p className="text-center text-sm text-muted-foreground">
        Slutför betalningen i Swish-appen.
      </p>
      <Badge
        variant="outline"
        className="border-border/80 bg-background/80 px-3.5 py-1.5 text-xs text-muted-foreground"
      >
        Sidan uppdateras automatiskt
      </Badge>
    </div>
  );
};

export default WaitingStatusPanel;

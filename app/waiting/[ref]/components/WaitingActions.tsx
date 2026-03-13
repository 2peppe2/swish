import { Button } from "@/components/ui/button";

interface WaitingActionsProps {
  shouldShowOpenSwishButton: boolean;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}

const WaitingActions = ({
  shouldShowOpenSwishButton,
  canCancel,
  isCancelling,
  onCancel,
}: WaitingActionsProps) => {
  return (
    <>
      {shouldShowOpenSwishButton && (
        <Button asChild className="h-12 w-full text-base font-semibold">
          <a href="swish://">Öppna Swish</a>
        </Button>
      )}

      <Button
        variant="outline"
        className="h-11 w-full border-border/90 bg-background"
        onClick={onCancel}
        disabled={!canCancel}
      >
        {isCancelling ? "Avbryter..." : "Avbryt betalning"}
      </Button>
    </>
  );
};

export default WaitingActions;

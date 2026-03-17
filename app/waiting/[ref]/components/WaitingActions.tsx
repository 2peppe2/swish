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

      <div className="flex justify-center">
        <Button
          variant="destructive"
          className="h-11"
          onClick={onCancel}
          disabled={!canCancel}
        >
          {isCancelling ? "Avbryter..." : "Avbryt betalning"}
        </Button>
      </div>
    </>
  );
};

export default WaitingActions;

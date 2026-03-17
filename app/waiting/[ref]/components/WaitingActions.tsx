import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11" disabled={!canCancel}>
              Avbryt betalning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avbryta väntande betalning?</DialogTitle>
              <DialogDescription>
                Om du avbryter nu stoppas den pågående Swish-förfrågan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isCancelling}>
                  Fortsätt vänta
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={onCancel}
                disabled={!canCancel}
              >
                {isCancelling ? "Avbryter..." : "Ja, avbryt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default WaitingActions;

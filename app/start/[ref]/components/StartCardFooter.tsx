"use client";

import { cancelPayment } from "@/app/action/cancelPayment";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

interface StartCardFooterProps {
  reference: string;
  callbackUrl: string;
}

const StartCardFooter: FC<StartCardFooterProps> = ({reference, callbackUrl}) => {
  const userRouter = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      await cancelPayment(reference);
      setIsOpen(false);
      userRouter.push(callbackUrl);
    } catch (error) {
      console.error("Failed to cancel payment:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <CardFooter className="flex flex-col-reverse items-start gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <CancelPaymentDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isCancelling={isCancelling}
        onCancel={handleCancel}
      />
      <div className="text-xs text-muted-foreground">
        Genom att fortsätta godkänner du{" "}
        <a href="/villkor" className="hover:underline">
          villkoren
        </a>
        .
      </div>
    </CardFooter>
  );
};

export default StartCardFooter;

interface CancelPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCancelling: boolean;
  onCancel: () => Promise<void>;
}

// Dialog extracted to keep the footer markup focused on layout.
const CancelPaymentDialog: FC<CancelPaymentDialogProps> = ({
  isOpen,
  onOpenChange,
  isCancelling,
  onCancel,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button variant="outline" className="w-full sm:w-auto">
        Avbryt
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Avbryt betalningen?</DialogTitle>
        <DialogDescription>
          Om du avbryter nu stoppas betalningen och du skickas tillbaka.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={isCancelling}>
            Fortsätt betala
          </Button>
        </DialogClose>
        <Button
          variant="destructive"
          onClick={() => void onCancel()}
          disabled={isCancelling}
        >
          {isCancelling ? "Avbryter..." : "Avbryt"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PaymentInfoDialog from "./PaymentInfoDialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface StartPaymentCardProps {
  formattedAmount: string;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onPhoneNumberBlur: () => void;
  phoneNumberError?: string;
  canSubmit: boolean;
}

const StartPaymentCard = ({
  formattedAmount,
  phoneNumber,
  onPhoneNumberChange,
  onPhoneNumberBlur,
  phoneNumberError,
  canSubmit,
}: StartPaymentCardProps) => {
  return (
    <Card className="border-border/80 bg-card/90 shadow-lg backdrop-blur">
      <CardHeader className="gap-4 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Betala med Swish</CardTitle>
            <CardDescription className="mt-1 text-base text-muted-foreground">
              Ange ditt mobilnummer för att godkänna betalningen.
            </CardDescription>
          </div>
          <PaymentInfoDialog />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Field data-invalid={!!phoneNumberError}>
            <FieldLabel htmlFor="payer-alias">Mobilnummer</FieldLabel>
            <div className="flex rounded-md shadow-xs">
              <span className="border-input bg-background text-muted-foreground -z-1 inline-flex items-center rounded-l-md border px-3 text-sm">
                +46
              </span>
              <Input
                id="payer-alias"
                type="tel"
                inputMode="tel"
                value={phoneNumber}
                onChange={(event) =>
                  onPhoneNumberChange(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                onBlur={onPhoneNumberBlur}
                placeholder="70 123 45 67"
                className="-ms-px rounded-l-none shadow-none h-12 text-base"
                pattern="(7[0-9]{8}|07[0-9]{8})"
                maxLength={10}
                aria-invalid={!!phoneNumberError}
              />
            </div>
            <FieldDescription>Mobilnummer kopplat till swish.</FieldDescription>
            <FieldError>{phoneNumberError}</FieldError>
          </Field>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/40 px-5 py-4">
          <div className="text-sm text-muted-foreground">Belopp att betala</div>
          <div className="text-3xl font-semibold">{formattedAmount}</div>
        </div>
        <Button className="h-12 w-full text-base font-semibold" disabled={!canSubmit}>
          Betala
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col-reverse items-start gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="w-full sm:w-auto">
          Avbryt
        </Button>
        <div className="text-xs text-muted-foreground">
          Genom att fortsätta godkänner du villkoren.
        </div>
      </CardFooter>
    </Card>
  );
};

export default StartPaymentCard;

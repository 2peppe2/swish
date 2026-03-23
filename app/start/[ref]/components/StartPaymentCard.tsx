import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import StartCardFooter from "./StartCardFooter";
import StartCardHeader from "./StartCardHeader";
import StartPayButton from "./startPayButton";
import { Payment } from "@/app/types/payment";
import { formattedAmount } from "@/lib/utils";

interface StartPaymentCardProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onPhoneNumberBlur: () => void;
  phoneNumberError?: string;
  canSubmit: boolean;
  payment: Payment
}

const StartPaymentCard = ({
  phoneNumber,
  onPhoneNumberChange,
  onPhoneNumberBlur,
  phoneNumberError,
  canSubmit,
  payment,
}: StartPaymentCardProps) => {
  return (
    <Card className="payment-flow-card border-border/80 bg-card/90 shadow-lg backdrop-blur">
      <StartCardHeader />
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
                pattern="(7[0-9]{8}|07[0-9]{8})" //TODO probably should be better validation.
                maxLength={10}
                aria-invalid={!!phoneNumberError}
                autoComplete="tel"
              />
            </div>
            <FieldDescription>Mobilnummer kopplat till swish.</FieldDescription>
            <FieldError>{phoneNumberError}</FieldError>
          </Field>
        </div>
        <div className="rounded-xl border border-border/80 bg-muted/40 px-5 py-4">
          <div className="text-sm text-muted-foreground">Belopp att betala</div>
          <div className="text-3xl font-semibold">{formattedAmount(payment.amount)}</div>
        </div>
      <StartPayButton canSubmit={canSubmit} reference={payment.payee_payment_reference} phoneNumber={phoneNumber} />  
      </CardContent>
      <StartCardFooter reference={payment.payee_payment_reference} callbackUrl={payment.redirect_url_on_payment} />
    </Card>
  );
};

export default StartPaymentCard;

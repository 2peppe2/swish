import StatusActions from "./StatusActions";

interface StatusDetailsProps {
  buttonLabel: string;
  callbackURL: string;
  isPaid: boolean;
  message: string;
  smallDate: string | null;
}

const StatusDetails = ({
  buttonLabel,
  callbackURL: primaryHref,
  isPaid,
  message,
  smallDate,
}: StatusDetailsProps) => {
  return (
    <section className="flex flex-col gap-4 text-center">
      
      {isPaid && 
      <div className="mx-auto max-w-xl flex flex-col items-center gap-4">
        <p className="text-sm leading-7 text-muted-foreground">
          <p className="font-semibold mb-2">Meddelade</p>
          {message}
        </p>
        {smallDate && (
          <p className="text-xs text-muted-foreground">
            Betalning mottagen: {smallDate  }
          </p>
        )}
      </div>
      }
      <StatusActions
        label={buttonLabel}
        primaryHref={primaryHref}
      />
      
    </section>
  );
};

export default StatusDetails;

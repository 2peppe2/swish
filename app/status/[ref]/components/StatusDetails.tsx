import StatusActions from "./StatusActions";

interface StatusDetailsProps {
  buttonLabel: string;
  primaryHref: string;
  isPaid: boolean;
  message: string;
  smallDate: string | null;
}

const StatusDetails = ({
  buttonLabel,
  primaryHref,
  isPaid,
  message,
  smallDate,
}: StatusDetailsProps) => {
  return (
    <section className="space-y-5 text-center">
      <div className="mx-auto max-w-xl space-y-2">
        <p className="text-sm leading-7 text-muted-foreground">
          {message}
        </p>

        {smallDate ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Senast uppdaterad {smallDate}
          </p>
        ) : null}
      </div>

      <StatusActions
        label={buttonLabel}
        primaryHref={primaryHref}
        isPaid={isPaid}
      />
    </section>
  );
};

export default StatusDetails;

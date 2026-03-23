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
      {isPaid && (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
          <div className="space-y-2">
            <p className="mb-2 font-semibold">Meddelande</p>
            <p className="text-sm leading-7 text-muted-foreground">
              {message}
            </p>
          </div>
          {smallDate && (
            <p className="text-xs text-muted-foreground">
              Betalning mottagen: {smallDate}
            </p>
          )}
        </div>
      )}
      <StatusActions label={buttonLabel} primaryHref={primaryHref} />
    </section>
  );
};

export default StatusDetails;

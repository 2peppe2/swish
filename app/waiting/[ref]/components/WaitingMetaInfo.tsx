interface WaitingMetaInfoProps {
  reference: string;
  requestError: string | null;
}

const WaitingMetaInfo = ({ reference, requestError }: WaitingMetaInfoProps) => {
  return (
    <>
      <p className="text-xs text-muted-foreground">
        Referens: <span className="font-mono">{reference}</span>
      </p>
      {requestError && (
        <p className="text-sm text-destructive" role="alert">
          {requestError}
        </p>
      )}
    </>
  );
};

export default WaitingMetaInfo;

interface WaitingStatusPanelProps {
  isTerminalStatus: boolean;
  activityStep: number;
  statusText: string;
}

const WaitingStatusPanel = ({
  isTerminalStatus,
  activityStep,
  statusText,
}: WaitingStatusPanelProps) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/80 bg-muted/40 px-5 py-6">
      {!isTerminalStatus && (
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5">
          <span className="text-xs text-muted-foreground">Vi håller koll</span>
          <span className="flex items-center gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((dotIndex) => {
              const distance = Math.abs(dotIndex - activityStep);
              const isActive = distance === 0;
              const isNear = distance === 1;

              return (
                <span
                  key={dotIndex}
                  className="h-1.5 w-1.5 rounded-full bg-primary transition-all duration-300"
                  style={{
                    opacity: isActive ? 1 : isNear ? 0.65 : 0.35,
                    transform: `translateY(${isActive ? "-1px" : "0px"}) scale(${isActive ? 1.1 : 1})`,
                  }}
                />
              );
            })}
          </span>
        </div>
      )}
      <p className="text-center text-sm text-muted-foreground">{statusText}</p>
    </div>
  );
};

export default WaitingStatusPanel;

import type { StatusContent } from "./statusContent";

interface StatusHeroProps {
  content: StatusContent;
}

const StatusHero = ({ content }: StatusHeroProps) => {
  const Icon = content.Icon;

  return (
    <div className={`px-6 py-8 text-center sm:px-8 sm:py-10`}>
      <div className="flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3">
          <span
            className="inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 text-lg font-medium uppercase tracking-[0.18em] shadow-sm"
            style={content.badgeStyle}
          >
            <Icon className="h-10 w-10" />
          </span>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {content.title}
            </h1>
            <p className="mx-auto max-w-xl text-sm/6 text-current/85 sm:text-base/7">
              {content.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusHero;

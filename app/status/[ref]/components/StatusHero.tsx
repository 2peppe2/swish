import { Badge } from "@/components/ui/badge";
import type { StatusContent } from "./statusContent";

interface StatusHeroProps {
  content: StatusContent;
}

const StatusHero = ({ content }: StatusHeroProps) => {
  const Icon = content.Icon;

  return (
    <div className={`px-6 py-8 text-center sm:px-8 sm:py-10 ${content.tone}`}>
      <div className="flex flex-col items-center gap-5">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-[1.75rem] border bg-background/75 shadow-lg ${content.iconWrap}`}
        >
          <Icon className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-current/20 bg-background/65 px-3 py-1 text-[11px] tracking-[0.18em] uppercase"
          >
            {content.badge}
          </Badge>
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

import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCcw } from "lucide-react";

interface StatusActionsProps {
  label: string;
  primaryHref: string;
  isPaid: boolean;
}

const StatusActions = ({ label, primaryHref, isPaid }: StatusActionsProps) => {
  return (
    <div className="flex justify-center">
      <Button asChild size="lg" className="h-11 min-w-48 rounded-full px-6">
        <a href={primaryHref}>
          {isPaid ? <ExternalLink /> : <RotateCcw />}
          {label}
        </a>
      </Button>
    </div>
  );
};

export default StatusActions;

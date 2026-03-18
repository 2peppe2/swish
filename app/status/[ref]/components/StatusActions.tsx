import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StatusActionsProps {
  label: string;
  primaryHref: string;
}

const StatusActions = ({ label, primaryHref: callbackURL }: StatusActionsProps) => {
  return (
    <div className="flex justify-center">
      <Button asChild size="lg" className="h-11 min-w-48 rounded-full px-6">
        <a href={callbackURL}>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
};

export default StatusActions;

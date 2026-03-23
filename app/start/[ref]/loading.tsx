import { Skeleton } from "@/components/ui/skeleton";

const LoadingStartPage = () => {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="payment-flow-card rounded-xl border border-border/80 bg-card/90 shadow-lg backdrop-blur">
          <div className="px-6 pt-6 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-7 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-44" />
                  <Skeleton className="h-5 w-72 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex rounded-md shadow-xs">
                <Skeleton className="h-12 w-14 rounded-r-none" />
                <Skeleton className="h-12 flex-1 rounded-l-none" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/40 px-5 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-9 w-36" />
            </div>

            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          <div className="flex flex-col-reverse items-start gap-3 border-t border-border/80 px-6 pt-5 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full rounded-md sm:w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingStartPage;

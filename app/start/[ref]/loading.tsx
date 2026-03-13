import { Skeleton } from "@/components/ui/skeleton"

const LoadingStartPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_circle_at_10%_10%,oklch(0.96_0.06_96/0.5),transparent_60%),radial-gradient(900px_circle_at_90%_0%,oklch(0.92_0.08_260/0.45),transparent_55%)] px-6 py-10">
      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
          <Skeleton className="h-7 w-40 rounded-full" />
        </div>
        <div className="rounded-xl border bg-white/80 p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-72" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingStartPage

import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-40 w-full max-w-xl rounded-lg" />
      <Skeleton className="h-20 w-full max-w-xl rounded-lg" />
    </div>
  )
}

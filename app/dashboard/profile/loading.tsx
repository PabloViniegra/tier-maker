import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      className="flex flex-col gap-6 p-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 w-full max-w-md rounded-lg" />
      <Skeleton className="h-20 w-full max-w-md rounded-lg" />
    </div>
  )
}

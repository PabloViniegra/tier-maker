import { cn } from '@/lib/utils'

type PublicTierItemProps = {
  url: string
  label: string
}

export function PublicTierItem({ url, label }: PublicTierItemProps) {
  return (
    <div className={cn('relative h-20 w-20 shrink-0')} data-testid="row-item">
      <div className="relative h-full w-full overflow-hidden rounded border border-border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          width={80}
          height={80}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  )
}

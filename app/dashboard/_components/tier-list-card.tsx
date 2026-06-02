import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/format-date'

export type TierListCardProps = {
  id: string
  title: string
  category: string
  itemCount: number
  createdAt: Date
}

function truncateCategory(cat: string, max = 20): string {
  return cat.length > max ? cat.slice(0, max) + '…' : cat
}

export function TierListCard({
  id,
  title,
  category,
  itemCount,
  createdAt,
  className,
  style,
}: TierListCardProps & { className?: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/dashboard/tier-lists/${id}`}
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors duration-200 hover:border-primary/20 hover:bg-overlay',
        className
      )}
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="h-5 text-[10px] max-w-[120px] truncate"
        >
          {truncateCategory(category)}
        </Badge>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatRelativeDate(createdAt)}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground leading-snug">{title}</p>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <span
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'pointer-events-none h-6 gap-1 px-2 text-xs'
          )}
        >
          Open
          <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}

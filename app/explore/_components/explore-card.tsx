import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/format-date'
import { getCategoryGradient, getInitials } from '@/lib/utils/cover-placeholder'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

type Props = PublicTierListSummary & {
  style?: React.CSSProperties
}

export function ExploreCard({
  id,
  title,
  category,
  itemCount,
  createdAt,
  creatorName,
  coverImageUrl,
  firstItemUrl,
  style,
}: Props) {
  const imageUrl = coverImageUrl ?? firstItemUrl ?? null

  return (
    <Link
      href={`/explore/${id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface overflow-hidden transition-colors duration-200 hover:border-primary/20 hover:bg-overlay"
      style={style}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div
            data-testid="card-cover-placeholder"
            className="h-full w-full flex items-center justify-center"
            style={{ background: getCategoryGradient(category) }}
          >
            <span className="text-white font-bold text-3xl select-none drop-shadow">
              {getInitials(title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="h-5 max-w-[120px] truncate text-[10px]">
            {category.length > 20 ? category.slice(0, 20) + '…' : category}
          </Badge>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeDate(createdAt)}
          </span>
        </div>

        <p className="text-sm font-medium leading-snug text-foreground">{title}</p>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            {creatorName && (
              <span className="text-[10px] text-muted-foreground/70">
                by {creatorName}
              </span>
            )}
          </div>
          <span
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'pointer-events-none h-6 gap-1 px-2 text-xs'
            )}
          >
            Fill
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}

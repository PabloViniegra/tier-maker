import { ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LikeButton } from '@/components/like-button'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/format-date'
import { getCategoryGradient, getInitials } from '@/lib/utils/cover-placeholder'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

type Props = {
  data: PublicTierListSummary
  isLiked: boolean
  isOwner: boolean
  isAuthenticated: boolean
  href?: string
  style?: React.CSSProperties
}

export function ExploreCard({
  data,
  isLiked,
  isOwner,
  isAuthenticated,
  href,
  style,
}: Props) {
  const {
    id,
    title,
    category,
    itemCount,
    createdAt,
    creatorName,
    coverImageUrl,
    firstItemUrl,
    likeCount,
  } = data
  const imageUrl = coverImageUrl ?? firstItemUrl ?? null
  const fillHref = href ?? `/explore/${data.slug}`

  return (
    <div
      className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-primary/20 hover:bg-overlay"
      style={style}
    >
      <Link href={fillHref} className="block">
        <ViewTransition name={`tier-cover-${id}`}>
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
                className="flex h-full w-full items-center justify-center"
                style={{ background: getCategoryGradient(category) }}
              >
                <span className="text-3xl font-bold text-white drop-shadow select-none">
                  {getInitials(title)}
                </span>
              </div>
            )}
          </div>
        </ViewTransition>
      </Link>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="h-5 max-w-[120px] truncate text-[10px]"
          >
            {category.length > 20 ? category.slice(0, 20) + '…' : category}
          </Badge>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeDate(createdAt)}
          </span>
        </div>

        <Link href={fillHref}>
          <p className="text-sm leading-snug font-medium text-foreground hover:underline">
            {title}
          </p>
        </Link>

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
          <div className="flex items-center gap-2">
            {!isOwner && (
              <LikeButton
                templateId={id}
                initialCount={likeCount}
                initialIsLiked={isLiked}
                isAuthenticated={isAuthenticated}
              />
            )}
            <Link
              href={fillHref}
              aria-label={`Fill ${title}`}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'h-6 gap-1 px-2 text-xs'
              )}
            >
              Fill
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

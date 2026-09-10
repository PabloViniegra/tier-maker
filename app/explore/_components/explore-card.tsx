import { ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LikeButton } from '@/components/like-button'
import { cn } from '@/lib/utils'
import { RelativeDate } from '@/components/relative-date'
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
  const { id, title, category, itemCount, createdAt, creatorName, likeCount, rows } = data
  const previewRows = rows.slice(0, 6)
  const imageUrl = data.coverImageUrl ?? data.firstItemUrl ?? null
  const fillHref = href ?? `/explore/${data.slug}`

  return (
    <div
      className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 outline-none hover:border-primary/20 hover:bg-overlay has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring"
      style={style}
    >
      <Link
        href={fillHref}
        aria-label={title}
        className="block after:absolute after:inset-0 after:z-10"
      >
        <ViewTransition name={`tier-cover-${id}`}>
          {previewRows.length > 0 ? (
            <div className="flex aspect-video w-full flex-col gap-1 bg-muted p-1.5">
              {previewRows.map((row) => (
                <div
                  key={row.order}
                  className="flex min-h-0 flex-1 items-stretch gap-1"
                >
                  <div
                    className="flex w-8 shrink-0 items-center justify-center rounded-sm font-heading text-xs font-bold text-white"
                    style={{ background: row.color }}
                  >
                    <span className="truncate px-0.5 select-none">
                      {row.label}
                    </span>
                  </div>
                  <div
                    className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-sm border border-border px-1"
                    style={{
                      background: `color-mix(in oklch, ${row.color} 15%, transparent)`,
                    }}
                  >
                    {row.firstItemUrl && (
                      <span className="relative block h-[calc(100%-4px)] aspect-square shrink-0">
                        <Image
                          src={row.firstItemUrl}
                          alt=""
                          fill
                          sizes="32px"
                          className="rounded-[2px] object-cover"
                        />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </ViewTransition>
      </Link>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="h-5 max-w-[120px] truncate text-xs"
          >
            {category.length > 20 ? category.slice(0, 20) + '…' : category}
          </Badge>
          <RelativeDate
            date={createdAt}
            className="shrink-0 text-xs text-muted-foreground"
          />
        </div>

        <p className="line-clamp-2 text-sm leading-snug font-medium break-words text-foreground">
          {title}
        </p>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            {creatorName && (
              <span className="max-w-[10rem] truncate text-xs text-muted-foreground">
                by {creatorName}
              </span>
            )}
          </div>
          <div className="relative z-20 flex items-center gap-2">
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
                'h-8 gap-1 px-3 text-xs sm:h-7 sm:px-2'
              )}
            >
              Fill
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

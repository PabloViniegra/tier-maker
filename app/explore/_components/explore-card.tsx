import { ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LikeButton } from '@/components/like-button'
import { RelativeDate } from '@/components/relative-date'
import { getCategoryGradient, getInitials } from '@/lib/utils/cover-placeholder'
import type { PublicTierListSummary } from '@/lib/queries/tier-templates'

const RANK_LABEL_MAX = 4

export function compactRankLabel(label: string): string {
  const trimmed = label.trim()
  if (trimmed.length <= RANK_LABEL_MAX) return trimmed
  const firstWord = trimmed.split(/\s+/)[0] ?? trimmed
  if (firstWord.length <= RANK_LABEL_MAX) return firstWord
  return firstWord.slice(0, 3)
}

type Props = {
  data: PublicTierListSummary
  isLiked: boolean
  isOwner: boolean
  isAuthenticated: boolean
  href?: string
  style?: React.CSSProperties
}

const thumbOutline =
  'outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10'

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
      className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 outline-none hover:border-foreground/20 hover:bg-overlay has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring"
      style={style}
    >
      <Link
        href={fillHref}
        aria-label={title}
        className="block after:absolute after:inset-0 after:z-10"
      >
        <ViewTransition name={`tier-cover-${id}`}>
          {previewRows.length > 0 ? (
            <div
              aria-hidden="true"
              className="flex aspect-video w-full flex-col gap-1 bg-muted p-1.5"
            >
              {previewRows.map((row) => (
                <div
                  key={row.order}
                  className="flex min-h-0 flex-1 items-stretch gap-1"
                >
                  <div
                    className="flex w-8 shrink-0 items-center justify-center rounded-sm font-heading text-[10px] leading-none font-bold text-white"
                    style={{ background: row.color }}
                  >
                    <span className="px-0.5 text-center select-none">
                      {compactRankLabel(row.label)}
                    </span>
                  </div>
                  <div
                    className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-sm border border-border px-0.5"
                    style={{
                      background: `color-mix(in oklch, ${row.color} 15%, transparent)`,
                    }}
                  >
                    {row.itemUrls.map((url, i) => (
                      <span
                        key={`${url}-${i}`}
                        className="relative block aspect-square h-[calc(100%-4px)] shrink-0"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="32px"
                          className={`rounded-sm object-cover ${thumbOutline}`}
                        />
                      </span>
                    ))}
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
                  className={`object-cover ${thumbOutline}`}
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
            className="h-5 max-w-[120px] truncate rounded-sm text-xs"
          >
            {category.length > 20 ? category.slice(0, 20) + '…' : category}
          </Badge>
          <RelativeDate
            date={createdAt}
            className="shrink-0 text-xs text-muted-foreground"
          />
        </div>

        <h2 className="line-clamp-2 text-sm leading-snug font-medium text-pretty break-words text-foreground">
          {title}
        </h2>

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
          {!isOwner && (
            <div className="relative z-20">
              <LikeButton
                templateId={id}
                initialCount={likeCount}
                initialIsLiked={isLiked}
                isAuthenticated={isAuthenticated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

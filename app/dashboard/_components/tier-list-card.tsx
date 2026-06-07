'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MoreVertical, Pencil } from 'lucide-react'
import { getInitials, getCategoryGradient } from '@/lib/utils/cover-placeholder'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/format-date'

export type TierListCardProps = {
  id: string
  title: string
  category: string
  itemCount: number
  createdAt: Date
  coverImageUrl?: string | null
  firstItemUrl?: string | null
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
  coverImageUrl,
  firstItemUrl,
  className,
  style,
}: TierListCardProps & { className?: string; style?: React.CSSProperties }) {
  const imageUrl = coverImageUrl ?? firstItemUrl ?? null
  const fillHref = `/dashboard/tier-lists/${id}`
  const editHref = `/dashboard/tier-lists/${id}/edit`

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-surface overflow-hidden transition-colors duration-200 hover:border-primary/20 hover:bg-overlay',
        className
      )}
      style={style}
    >
      <Link href={fillHref} className="relative aspect-video w-full overflow-hidden bg-muted block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      </Link>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="h-5 text-[10px] max-w-[120px] truncate"
          >
            {truncateCategory(category)}
          </Badge>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(createdAt)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`Options for ${title}`}
              >
                <MoreVertical size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[7rem]">
                <DropdownMenuItem>
                  <Link href={editHref} className="flex items-center gap-2 w-full">
                    <Pencil size={13} />
                    Edit
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground leading-snug">{title}</p>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <Link
            href={fillHref}
            aria-label={`Open ${title}`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-6 gap-1 px-2 text-xs'
            )}
          >
            Open
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

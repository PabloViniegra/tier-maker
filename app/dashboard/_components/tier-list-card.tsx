'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Heart,
  Link as LinkIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getInitials, getCategoryGradient } from '@/lib/utils/cover-placeholder'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/format-date'
import { deleteTierList } from '@/app/dashboard/tier-lists/_actions/delete-tier-list'

export type TierListCardProps = {
  id: string
  slug: string
  title: string
  category: string
  itemCount: number
  createdAt: Date | string
  coverImageUrl?: string | null
  firstItemUrl?: string | null
  likeCount?: number
}

function truncateCategory(cat: string, max = 20): string {
  return cat.length > max ? cat.slice(0, max) + '…' : cat
}

export function TierListCard({
  id,
  slug,
  title,
  category,
  itemCount,
  createdAt,
  coverImageUrl,
  firstItemUrl,
  likeCount,
  className,
  style,
}: TierListCardProps & { className?: string; style?: React.CSSProperties }) {
  const imageUrl = coverImageUrl ?? firstItemUrl ?? null
  const fillHref = `/dashboard/tier-lists/${id}`
  const editHref = `/dashboard/tier-lists/${id}/edit`

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className={cn(
        'flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-primary/20 hover:bg-overlay',
        className
      )}
      style={style}
    >
      <Link
        href={fillHref}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
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
            className="flex h-full w-full items-center justify-center"
            style={{ background: getCategoryGradient(category) }}
          >
            <span className="text-3xl font-bold text-white drop-shadow select-none">
              {getInitials(title)}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="h-5 max-w-[120px] truncate text-[10px]"
          >
            {truncateCategory(category)}
          </Badge>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(createdAt)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`Options for ${title}`}
              >
                <MoreVertical size={12} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[7rem]">
                <DropdownMenuItem>
                  <Link
                    href={editHref}
                    className="flex w-full items-center gap-2"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/explore/${slug}`
                    )
                    toast.success('Link copied')
                  }}
                >
                  <LinkIcon size={13} />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDialogOpen(true)}
                >
                  <Trash2 size={13} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-snug font-medium break-words text-foreground">
          {title}
        </p>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            {likeCount !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Heart size={10} aria-hidden="true" />
                {likeCount}
              </span>
            )}
          </div>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isPending) setDialogOpen(open)
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete tier list</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{title}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isPending} />}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await deleteTierList(id)
                    toast.success('Tier list deleted')
                    setDialogOpen(false)
                  } catch {
                    toast.error('Failed to delete tier list')
                  }
                })
              }}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

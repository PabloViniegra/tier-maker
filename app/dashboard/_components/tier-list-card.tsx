'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Heart,
  Link as LinkIcon,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getInitials, getCategoryGradient } from '@/lib/utils/cover-placeholder'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { RelativeDate } from '@/components/relative-date'
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
  isPublic: boolean
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
  isPublic,
  className,
  style,
}: TierListCardProps & { className?: string; style?: React.CSSProperties }) {
  const imageUrl = coverImageUrl ?? firstItemUrl ?? null
  const fillHref = `/dashboard/tier-lists/${id}`
  const editHref = `/dashboard/tier-lists/${id}/edit`

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
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
        aria-label={`Open ${title}`}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
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
          <div className="flex min-w-0 items-center gap-1.5">
            <Badge
              variant="secondary"
              className="h-5 max-w-[120px] truncate text-xs"
            >
              {truncateCategory(category)}
            </Badge>
            {!isPublic && (
              <Badge
                variant="secondary"
                className="h-5 shrink-0 text-xs text-muted-foreground"
              >
                Private
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-muted-foreground">
              <RelativeDate date={createdAt} />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`Options for ${title}`}
              >
                <MoreVertical size={12} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[7rem]">
                <DropdownMenuItem render={<Link href={editHref} />}>
                  <Pencil size={13} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    const origin = window.location.origin
                    try {
                      await navigator.clipboard.writeText(
                        isPublic
                          ? `${origin}/explore/${slug}`
                          : `${origin}${editHref}`
                      )
                      if (isPublic) {
                        toast.success('Link copied')
                      } else {
                        toast.info('Private tier list — editor link copied')
                      }
                    } catch {
                      toast.error('Could not copy link. Try again.')
                    }
                  }}
                >
                  <LinkIcon size={13} />
                  Copy Link
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
                <span className="sr-only">likes</span>
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

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (isPending) return
          setDialogOpen(open)
          if (!open) setDeleteError(undefined)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tier list?</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              <strong className="font-medium text-foreground">{title}</strong>{' '}
              {isPublic
                ? 'will be removed from Explore and permanently deleted'
                : 'will be permanently deleted'}
              {likeCount
                ? `, along with its ${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`
                : ''}
              . This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isPending}
              aria-busy={isPending}
              onClick={() => {
                setDeleteError(undefined)
                startTransition(async () => {
                  try {
                    await deleteTierList(id)
                    toast.success('Tier list deleted')
                    setDialogOpen(false)
                  } catch {
                    setDeleteError(
                      "Couldn't delete this tier list. Check your connection and try again."
                    )
                  }
                })
              }}
            >
              {isPending && (
                <Loader2
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

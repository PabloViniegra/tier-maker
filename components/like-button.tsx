'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ActionTooltip } from '@/components/action-tooltip'
import { cn } from '@/lib/utils'
import { likeHeartVariants } from '@/lib/motion-variants'
import { toggleLike } from '@/app/explore/_actions/toggle-like'

type Props = {
  templateId: string
  initialCount: number
  initialIsLiked: boolean
  isAuthenticated: boolean
  iconOnly?: boolean
  showTooltip?: boolean
}

const likeClassName = (isLiked: boolean, iconOnly: boolean) =>
  cn(
    'flex min-h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
    isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400',
    iconOnly &&
      'min-h-11 min-w-11 rounded-lg sm:min-h-9 sm:min-w-9'
  )

export function LikeButton({
  templateId,
  initialCount,
  initialIsLiked,
  isAuthenticated,
  iconOnly = false,
  showTooltip = false,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [state, setState] = useState({
    count: initialCount,
    isLiked: initialIsLiked,
  })

  function handleClick() {
    const previous = state
    const nextLiked = !state.isLiked
    setState({
      count: state.count + (nextLiked ? 1 : -1),
      isLiked: nextLiked,
    })

    startTransition(async () => {
      try {
        await toggleLike(templateId)
        router.refresh()
      } catch {
        setState(previous)
        toast.error('Could not update like. Try again.', {
          action: { label: 'Retry', onClick: () => handleClick() },
        })
      }
    })
  }

  const content = (
    <>
      <motion.span
        variants={likeHeartVariants}
        animate={state.isLiked ? 'liked' : 'idle'}
        className="inline-flex"
      >
        <Heart
          size={14}
          className={cn(state.isLiked && 'fill-current')}
          aria-hidden="true"
        />
      </motion.span>
      <span className="tabular-nums">{state.count}</span>
    </>
  )
  const accessibleLabel = `${state.isLiked ? 'Unlike' : 'Like'} (${state.count})`

  const control = !isAuthenticated ? (
    <Link
      href="/login"
      aria-label={accessibleLabel}
      className={likeClassName(state.isLiked, iconOnly)}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={handleClick}
      aria-label={accessibleLabel}
      className={likeClassName(state.isLiked, iconOnly)}
    >
      {content}
    </button>
  )

  return showTooltip ? (
    <ActionTooltip label={state.isLiked ? 'Unlike' : 'Like'}>
      {control}
    </ActionTooltip>
  ) : (
    control
  )
}

'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { likeHeartVariants } from '@/lib/motion-variants'
import { toggleLike } from '@/app/explore/_actions/toggle-like'

type Props = {
  templateId: string
  initialCount: number
  initialIsLiked: boolean
  isAuthenticated: boolean
}

export function LikeButton({
  templateId,
  initialCount,
  initialIsLiked,
  isAuthenticated,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [state, setState] = useState({
    count: initialCount,
    isLiked: initialIsLiked,
  })

  function handleClick() {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

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
        toast.error('Failed to update like')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={state.isLiked ? 'Unlike' : 'Like'}
      className={cn(
        'flex items-center gap-1 text-xs transition-colors',
        state.isLiked
          ? 'text-rose-500'
          : 'text-muted-foreground hover:text-rose-400'
      )}
    >
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
      <span>{state.count}</span>
    </button>
  )
}
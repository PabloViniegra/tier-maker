'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
  const [committed, setCommitted] = useState({
    count: initialCount,
    isLiked: initialIsLiked,
  })
  const [optimistic, setOptimistic] = useOptimistic(
    committed,
    (state, liked: boolean) => ({
      count: liked ? state.count + 1 : state.count - 1,
      isLiked: liked,
    })
  )

  function handleClick() {
    if (!isAuthenticated) {
      router.push('/auth/sign-in')
      return
    }

    const nextLiked = !optimistic.isLiked
    startTransition(async () => {
      setOptimistic(nextLiked)
      try {
        await toggleLike(templateId)
        setCommitted((prev) => ({
          count: nextLiked ? prev.count + 1 : prev.count - 1,
          isLiked: nextLiked,
        }))
        router.refresh()
      } catch {
        toast.error('Failed to update like')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={optimistic.isLiked ? 'Unlike' : 'Like'}
      className={cn(
        'flex items-center gap-1 text-xs transition-colors',
        optimistic.isLiked
          ? 'text-rose-500'
          : 'text-muted-foreground hover:text-rose-400'
      )}
    >
      <Heart
        size={14}
        className={cn(optimistic.isLiked && 'fill-current')}
        aria-hidden="true"
      />
      <span>{optimistic.count}</span>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { ActionTooltip } from '@/components/action-tooltip'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  text?: string
  url: string
  iconOnly?: boolean
  showTooltip?: boolean
}

export function ShareButton({
  title,
  text,
  url,
  iconOnly = false,
  showTooltip = false,
}: Props) {
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    if (sharing) return
    setSharing(true)

    try {
      const absoluteUrl = new URL(url, window.location.origin).toString()

      if (navigator.share) {
        try {
          const shareData: ShareData = { title, url: absoluteUrl }
          if (text) shareData.text = text
          await navigator.share(shareData)
          toast.success('Link shared')
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }
        }
      }

      if (!navigator.clipboard) {
        throw new Error('Clipboard unavailable')
      }

      await navigator.clipboard.writeText(absoluteUrl)
      toast.success('Link copied')
    } catch {
      toast.error('Could not share link. Try again.')
    } finally {
      setSharing(false)
    }
  }

  const button = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={sharing}
      aria-busy={sharing}
      aria-label="Share"
      className={iconOnly ? 'h-11 w-11 gap-1.5 p-0 sm:h-9 sm:w-9' : 'gap-1.5'}
    >
      <Share2 size={14} aria-hidden="true" />
      <span className={iconOnly ? 'sr-only' : undefined}>
        {sharing ? 'Sharing…' : 'Share'}
      </span>
    </Button>
  )

  return showTooltip ? (
    <ActionTooltip label="Share">{button}</ActionTooltip>
  ) : (
    button
  )
}

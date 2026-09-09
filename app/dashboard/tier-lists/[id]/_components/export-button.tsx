'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Loader2 } from 'lucide-react'
import { ActionTooltip } from '@/components/action-tooltip'
import { Button } from '@/components/ui/button'

// Resolved at export time from the live document so dark/light mode is respected.
function resolvedBg(): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim() || '#0d0d0d'
  )
}

type Props = {
  boardRef: React.RefObject<HTMLElement | null>
  title: string
  variant?: 'default' | 'outline'
  iconOnly?: boolean
  showTooltip?: boolean
}

export function ExportButton({
  boardRef,
  title,
  variant = 'outline',
  iconOnly = false,
  showTooltip = false,
}: Props) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!boardRef.current || exporting) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      // Run twice — first pass warms the image cache, second pass is clean.
      await toPng(boardRef.current, { cacheBust: true })
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: resolvedBg(),
        style: {
          borderRadius: '12px',
          padding: '20px',
        },
      })
      const link = document.createElement('a')
      link.download = `${title || 'tier-list'}.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast.error('Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }

  const button = (
    <Button
      variant={variant}
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      aria-label="Export"
      aria-busy={exporting}
      className={iconOnly ? 'h-11 w-11 gap-1.5 p-0 sm:h-9 sm:w-9' : 'gap-1.5'}
    >
      {exporting ? (
        <Loader2
          size={14}
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Download size={14} aria-hidden="true" />
      )}
      <span className={iconOnly ? 'sr-only' : undefined}>
        {exporting ? 'Exporting…' : 'Export'}
      </span>
    </Button>
  )

  return showTooltip ? (
    <ActionTooltip label="Export">{button}</ActionTooltip>
  ) : (
    button
  )
}

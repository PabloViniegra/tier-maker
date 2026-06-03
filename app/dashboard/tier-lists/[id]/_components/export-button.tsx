'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Resolved at export time from the live document so dark/light mode is respected.
function resolvedBg(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--background')
    .trim() || '#0d0d0d'
}

type Props = {
  boardRef: React.RefObject<HTMLElement | null>
  title: string
}

export function ExportButton({ boardRef, title }: Props) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!boardRef.current || exporting) return
    setExporting(true)
    try {
      // Capture the live board element directly (no clone) so all images
      // and computed styles are already resolved. Run twice — first pass
      // warms the image cache inside html-to-image, second pass is clean.
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
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={exporting}
      className='gap-1.5'
    >
      {exporting ? <Loader2 size={14} className='animate-spin' /> : <Download size={14} />}
      Export
    </Button>
  )
}

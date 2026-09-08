'use client'

import type { ReactElement } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Props = {
  label: string
  children: ReactElement
}

export function ActionTooltip({ label, children }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side="top"
        sideOffset={8}
        className="rounded-lg border border-background/15 px-2.5 py-1.5 text-[0.7rem] font-medium shadow-lg"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

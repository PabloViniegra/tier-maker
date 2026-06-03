'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = { state: SaveState }

const CONFIG: Record<
  Exclude<SaveState, 'idle'>,
  { label: string; icon: React.ReactNode; className: string }
> = {
  saving: {
    label: 'Saving…',
    icon: <Loader2 size={12} className='animate-spin' />,
    className: 'text-muted-foreground',
  },
  saved: {
    label: 'Saved',
    icon: <Check size={12} />,
    className: 'text-emerald-500',
  },
  error: {
    label: 'Save failed',
    icon: <AlertCircle size={12} />,
    className: 'text-destructive',
  },
}

export function SaveIndicator({ state }: Props) {
  const config = state !== 'idle' ? CONFIG[state] : null

  return (
    <AnimatePresence mode='wait'>
      {config && (
        <motion.span
          key={state}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className={cn('flex items-center gap-1.5 text-xs font-medium', config.className)}
        >
          {config.icon}
          {config.label}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

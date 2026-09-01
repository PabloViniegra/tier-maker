'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  HERO_DEMO_STEP_INTERVAL,
  HERO_DEMO_RESET_PAUSE,
  heroDemoChipVariants,
  heroDemoBankChipVariants,
  heroDemoRowRevealVariants,
} from '@/lib/motion-variants'

// Tier rows — uses the canonical app palette from lib/validators/tier-list.ts
const TIERS = [
  { label: 'S', color: 'oklch(0.65 0.22 250)' },
  { label: 'A', color: 'oklch(0.65 0.20 145)' },
  { label: 'B', color: 'oklch(0.68 0.18 75)' },
  { label: 'C', color: 'oklch(0.65 0.20 45)' },
]

// Staging-bank items that drift into tiers one by one
const SEQUENCE: { tierIndex: number; label: string }[] = [
  { tierIndex: 0, label: 'Interstellar' },
  { tierIndex: 0, label: 'Parasite' },
  { tierIndex: 1, label: 'Dune' },
  { tierIndex: 1, label: 'Blade Runner 2049' },
  { tierIndex: 2, label: 'Arrival' },
  { tierIndex: 3, label: 'The Menu' },
]

// All bank labels (shown dimmed before they drift)
const BANK_LABELS = SEQUENCE.map((s) => s.label)

interface PlacedChip {
  id: string
  tierIndex: number
  label: string
}

const ALL_PLACED: PlacedChip[] = SEQUENCE.map((entry, i) => ({
  id: `chip-${i}`,
  tierIndex: entry.tierIndex,
  label: entry.label,
}))

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

export function HeroDemo() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
  const [placed, setPlaced] = useState<PlacedChip[]>([])
  const [placing, setPlacing] = useState<number | null>(null)
  const cancelledRef = useRef(false)
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reducedMotion) return

    cancelledRef.current = false

    function scheduleNext(currentStep: number, currentPlaced: PlacedChip[]) {
      if (cancelledRef.current) return

      if (currentStep >= SEQUENCE.length) {
        // All chips placed — pause, then reset
        frameRef.current = setTimeout(() => {
          if (cancelledRef.current) return
          setPlaced([])
          setPlacing(null)
          frameRef.current = setTimeout(() => {
            if (cancelledRef.current) return
            scheduleNext(0, [])
          }, 600)
        }, HERO_DEMO_RESET_PAUSE * 1000)
        return
      }

      setPlacing(currentStep)

      frameRef.current = setTimeout(() => {
        if (cancelledRef.current) return

        const entry = SEQUENCE[currentStep]
        const newChip: PlacedChip = {
          id: `chip-${currentStep}-${Date.now()}`,
          tierIndex: entry.tierIndex,
          label: entry.label,
        }
        const nextPlaced = [...currentPlaced, newChip]

        setPlaced(nextPlaced)
        setPlacing(null)
        const nextStep = currentStep + 1

        frameRef.current = setTimeout(
          () => scheduleNext(nextStep, nextPlaced),
          HERO_DEMO_STEP_INTERVAL * 1000
        )
      }, 280)
    }

    frameRef.current = setTimeout(() => scheduleNext(0, []), 1200)

    return () => {
      cancelledRef.current = true
      if (frameRef.current !== null) clearTimeout(frameRef.current)
    }
  }, [reducedMotion])

  const chipsPlaced = reducedMotion ? ALL_PLACED : placed
  const placingIndex = reducedMotion ? null : placing

  return (
    <div
      className="flex flex-col gap-1.5"
      aria-hidden="true"
      role="presentation"
    >
      {/* Tier rows */}
      {TIERS.map((tier, tierIndex) => {
        const chips = chipsPlaced.filter((c) => c.tierIndex === tierIndex)
        return (
          <motion.div
            key={tier.label}
            className="flex items-stretch gap-1.5"
            variants={heroDemoRowRevealVariants}
            initial="hidden"
            animate="visible"
            custom={tierIndex * 0.06}
          >
            {/* Tier label badge */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded font-heading text-xs font-bold text-white"
              style={{ background: tier.color }}
            >
              {tier.label}
            </div>

            {/* Chips area */}
            <div className="flex min-h-8 flex-1 flex-wrap items-center gap-1 rounded border border-border bg-background px-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((chip) => (
                  <motion.span
                    key={chip.id}
                    variants={heroDemoChipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="rounded bg-muted px-2 py-0.5 text-xs text-foreground"
                  >
                    {chip.label}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}

      {/* Staging bank */}
      <div className="mt-1 flex flex-wrap gap-1">
        {BANK_LABELS.map((label, i) => {
          const alreadyPlaced = chipsPlaced.some((c) => c.label === label)
          const isBeingPlaced = placingIndex === i

          if (alreadyPlaced) return null

          return (
            <motion.span
              key={label}
              variants={heroDemoBankChipVariants}
              animate={isBeingPlaced ? 'placing' : 'idle'}
              className="rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {label}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}

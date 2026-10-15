'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { ImageDown, RotateCcw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  HERO_DEMO_LIFT_PAUSE,
  HERO_DEMO_STEP_INTERVAL,
  heroDemoBackdropVariants,
  heroDemoBoardVariants,
  heroDemoChipVariants,
  heroDemoCollapseVariants,
  heroDemoLayoutTransition,
  heroDemoRowRevealVariants,
  heroDemoRowTargetVariants,
  heroDemoSheenVariants,
  heroDemoTierLabelVariants,
} from '@/lib/motion-variants'

// Tier rows — uses the canonical app palette from lib/validators/tier-list.ts
const TIERS = [
  { label: 'S', color: 'oklch(0.65 0.22 250)' },
  { label: 'A', color: 'oklch(0.65 0.20 145)' },
  { label: 'B', color: 'oklch(0.68 0.18 75)' },
  { label: 'C', color: 'oklch(0.65 0.20 45)' },
]

const BANK = TIERS.length

// Drops this far outside the board still count; beyond it the chip snaps home
const DROP_SLOP = 32

const ITEMS = [
  { id: 'interstellar', label: 'Interstellar', tier: 0 },
  { id: 'parasite', label: 'Parasite', tier: 0 },
  { id: 'dune', label: 'Dune', tier: 1 },
  { id: 'blade-runner', label: 'Blade Runner 2049', tier: 1 },
  { id: 'arrival', label: 'Arrival', tier: 2 },
  { id: 'the-menu', label: 'The Menu', tier: 3 },
]

interface Placement {
  id: string
  tier: number
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function labelOf(id: string) {
  return ITEMS.find((item) => item.id === id)?.label ?? id
}

export function HeroDemo() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
  // null until the autoplay or the visitor writes the first placement
  const [placed, setPlaced] = useState<Placement[] | null>(null)
  const [lifted, setLifted] = useState<string | null>(null)
  const [interacted, setInteracted] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [mode, setMode] = useState<'edit' | 'export'>('edit')
  const [announcement, setAnnouncement] = useState('')

  const boardRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<string | null>(null)
  const hintId = useId()

  const board = placed ?? (reducedMotion ? ITEMS : [])
  const bankItems = ITEMS.filter((item) => !board.some((p) => p.id === item.id))

  useEffect(() => {
    if (reducedMotion || interacted) return

    let timer: ReturnType<typeof setTimeout>
    let cancelled = false

    function step(index: number) {
      if (cancelled || index >= ITEMS.length) return
      const { id, tier } = ITEMS[index]
      setLifted(id)
      timer = setTimeout(() => {
        if (cancelled) return
        setPlaced((prev) =>
          prev?.some((p) => p.id === id)
            ? prev
            : [...(prev ?? []), { id, tier }]
        )
        setLifted(null)
        timer = setTimeout(
          () => step(index + 1),
          HERO_DEMO_STEP_INTERVAL * 1000
        )
      }, HERO_DEMO_LIFT_PAUSE * 1000)
    }

    timer = setTimeout(() => step(0), 1200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [reducedMotion, interacted])

  useEffect(() => {
    if (!pendingFocus.current) return
    chipRefs.current.get(pendingFocus.current)?.focus()
    pendingFocus.current = null
  })

  function takeOver() {
    if (interacted) return
    setInteracted(true)
    setLifted(null)
    setPlaced(board)
  }

  function locationOf(id: string) {
    return board.find((p) => p.id === id)?.tier ?? BANK
  }

  function move(id: string, tier: number) {
    const rest = board.filter((p) => p.id !== id)
    setPlaced(tier === BANK ? rest : [...rest, { id, tier }])
    setAnnouncement(
      tier === BANK
        ? `${labelOf(id)} moved back to the item bank.`
        : `${labelOf(id)} moved to tier ${TIERS[tier].label}.`
    )
  }

  function nearestRow(info: PanInfo) {
    const x = info.point.x - window.scrollX
    const y = info.point.y - window.scrollY
    const bounds = boardRef.current?.getBoundingClientRect()
    if (
      !bounds ||
      x < bounds.left - DROP_SLOP ||
      x > bounds.right + DROP_SLOP ||
      y < bounds.top - DROP_SLOP ||
      y > bounds.bottom + DROP_SLOP
    )
      return null
    let best: number | null = null
    let bestDistance = Infinity
    rowRefs.current.forEach((row, index) => {
      if (!row) return
      const rect = row.getBoundingClientRect()
      const distance =
        y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0
      if (distance < bestDistance) {
        best = index
        bestDistance = distance
      }
    })
    return best
  }

  function handleDrag(info: PanInfo) {
    const row = nearestRow(info)
    if (row !== target) setTarget(row)
  }

  function handleDragEnd(id: string, info: PanInfo) {
    const row = nearestRow(info)
    setDragging(null)
    setTarget(null)
    if (row !== null && row !== locationOf(id)) move(id, row)
  }

  function handleKeyDown(id: string, event: KeyboardEvent) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const from = locationOf(id)
    const to =
      event.key === 'ArrowUp' ? Math.max(0, from - 1) : Math.min(BANK, from + 1)
    if (to === from) return
    takeOver()
    pendingFocus.current = id
    move(id, to)
  }

  function reset() {
    takeOver()
    setPlaced([])
    setAnnouncement('All titles moved back to the item bank.')
  }

  function toggleExport() {
    takeOver()
    const next = mode === 'edit' ? 'export' : 'edit'
    setMode(next)
    setAnnouncement(
      next === 'export'
        ? 'Showing the export preview. Buttons and the item bank are left out of the PNG.'
        : 'Back to editing.'
    )
  }

  function renderChip(id: string) {
    const active = dragging === id || lifted === id
    return (
      <motion.button
        key={id}
        ref={(el) => {
          if (el) chipRefs.current.set(id, el)
          else chipRefs.current.delete(id)
        }}
        type="button"
        layoutId={`hero-chip-${id}`}
        layout
        transition={{ layout: heroDemoLayoutTransition }}
        drag={mode === 'edit'}
        dragMomentum={false}
        dragSnapToOrigin
        onDragStart={() => {
          takeOver()
          setDragging(id)
        }}
        onDrag={(_, info) => handleDrag(info)}
        onDragEnd={(_, info) => handleDragEnd(id, info)}
        onKeyDown={(event) => handleKeyDown(id, event)}
        onFocus={takeOver}
        variants={heroDemoChipVariants}
        initial={false}
        animate={lifted === id ? 'lifted' : 'rest'}
        whileDrag="lifted"
        aria-describedby={hintId}
        className="relative h-6 cursor-grab touch-none rounded border border-border bg-muted px-2 text-xs text-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        style={{ zIndex: active ? 20 : 1 }}
      >
        {labelOf(id)}
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        ref={boardRef}
        role="group"
        aria-label="Sample tier list you can rearrange"
        inert={mode === 'export'}
        variants={heroDemoBoardVariants}
        initial={false}
        animate={mode}
        className="relative flex flex-col gap-1.5 rounded-lg p-2"
      >
        <motion.div
          aria-hidden="true"
          variants={heroDemoBackdropVariants}
          className="absolute inset-0 rounded-lg border border-border bg-background"
        />

        {TIERS.map((tier, tierIndex) => {
          const isTarget = dragging !== null && target === tierIndex
          return (
            <motion.div
              key={tier.label}
              className="relative flex items-stretch gap-1.5"
              variants={heroDemoRowRevealVariants}
              initial="hidden"
              animate="visible"
              custom={tierIndex * 0.06}
            >
              <motion.div
                aria-hidden="true"
                variants={heroDemoTierLabelVariants}
                initial={false}
                animate={isTarget ? 'active' : 'idle'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded font-heading text-xs font-bold text-white"
                style={{ background: tier.color }}
              >
                {tier.label}
              </motion.div>

              <div
                ref={(el) => {
                  rowRefs.current[tierIndex] = el
                }}
                aria-label={`Tier ${tier.label}`}
                role="list"
                className="relative flex min-h-8 flex-1 flex-wrap items-center gap-1 rounded border border-border bg-background px-1"
              >
                <motion.div
                  aria-hidden="true"
                  variants={heroDemoRowTargetVariants}
                  initial={false}
                  animate={isTarget ? 'active' : 'idle'}
                  className="pointer-events-none absolute inset-0 rounded"
                  style={{ background: tier.color }}
                />
                {board
                  .filter((p) => p.tier === tierIndex)
                  .map((p) => (
                    <div key={p.id} role="listitem" className="contents">
                      {renderChip(p.id)}
                    </div>
                  ))}
              </div>
            </motion.div>
          )
        })}

        <AnimatePresence initial={false}>
          {mode === 'edit' ? (
            <motion.div
              key="bank"
              variants={heroDemoCollapseVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-visible"
            >
              <div
                ref={(el) => {
                  rowRefs.current[BANK] = el
                }}
                aria-label={bankItems.length > 0 ? 'Item bank' : undefined}
                role={bankItems.length > 0 ? 'list' : undefined}
                className={cn(
                  'relative mt-1 flex min-h-8 flex-wrap items-center gap-1 rounded border border-dashed px-1',
                  dragging !== null && target === BANK
                    ? 'border-muted-foreground'
                    : 'border-border'
                )}
              >
                {bankItems.length === 0 ? (
                  <span className="px-1 text-xs text-muted-foreground">
                    Every title is ranked.
                  </span>
                ) : (
                  bankItems.map((item) => (
                    <div key={item.id} role="listitem" className="contents">
                      {renderChip(item.id)}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
        >
          <AnimatePresence>
            {mode === 'export' ? (
              <motion.div
                key="sheen"
                variants={heroDemoSheenVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-y-0 w-2/3 -skew-x-12 bg-linear-to-r from-transparent via-white/15 to-transparent"
              />
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-2">
        {mode === 'edit' ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            Drag a title into a row, or focus it and press{' '}
            <kbd className="rounded-sm border border-border bg-muted px-1 font-mono text-[11px] text-foreground">
              ↑
            </kbd>{' '}
            <kbd className="rounded-sm border border-border bg-muted px-1 font-mono text-[11px] text-foreground">
              ↓
            </kbd>
          </p>
        ) : (
          <p id={hintId} className="font-mono text-xs text-muted-foreground">
            tier-list.png · 2×
          </p>
        )}
        <div className="flex items-center gap-1">
          {mode === 'edit' ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={reset}
              disabled={board.length === 0}
            >
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
          ) : null}
          <Button variant="outline" size="xs" onClick={toggleExport}>
            {mode === 'edit' ? (
              <>
                <ImageDown aria-hidden="true" />
                Preview export
              </>
            ) : (
              <>
                <Undo2 aria-hidden="true" />
                Back to editing
              </>
            )}
          </Button>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

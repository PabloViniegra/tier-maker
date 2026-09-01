import type { Variants } from 'motion/react'

export const STAGGER_DELAY = 0.06
export const MAX_STAGGER = 4
export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const

export function staggerIndex(i: number): number {
  return Math.min(i, MAX_STAGGER - 1)
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE_SMOOTH, delay },
  }),
}

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_DELAY },
  },
}

export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
}

export const springTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 35,
}

export const statusFadeVariants: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15, ease: 'easeInOut' } },
}

const dragIdle = { scale: 1, opacity: 1, boxShadow: 'none', zIndex: 0 }

export const dragActiveVariants: Variants = {
  idle: dragIdle,
  rest: dragIdle,
  hover: dragIdle,
  dragging: {
    scale: 1.08,
    opacity: 1,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 50,
    transition: { duration: 0.12, ease: EASE_SMOOTH },
  },
}

export const sidebarVariants: Variants = {
  expanded: { width: 240 },
  collapsed: { width: 56 },
}

export const sidebarLabelVariants: Variants = {
  expanded: { opacity: 1, transition: { duration: 0.2, ease: EASE_SMOOTH } },
  collapsed: { opacity: 0, transition: { duration: 0.1, ease: EASE_SMOOTH } },
}

export const bentoIconFloatVariants = {
  y: [0, -3, 0],
  transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' as const },
}

export const bentoSpotlightVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0 },
  hovered: { opacity: 1, transition: { duration: 0.5, ease: EASE_SMOOTH } },
}

export function bentoIconFloat(delay = 0) {
  return {
    y: [0, -3, 0],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: 'easeInOut' as const,
      delay,
    },
  }
}

export const cardLiftVariants: Variants = {
  hover: { y: -2, transition: springTransition },
  tap: { scale: 0.99, y: 0, transition: { duration: 0.1, ease: 'easeOut' } },
}

// ── Hero Demo animation variants ──────────────────────────────────────────────

/** Duration for a chip drifting from the bank into a tier row */
export const HERO_DEMO_DRIFT_DURATION = 0.55

/** Pause between sequential chip placements (seconds) */
export const HERO_DEMO_STEP_INTERVAL = 0.9

/** Full loop pause before resetting (seconds) */
export const HERO_DEMO_RESET_PAUSE = 2.2

/**
 * Chip that is seated inside a tier row — appears with a short fade-up.
 * Used with AnimatePresence so chips exit on reset.
 */
export const heroDemoChipVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: HERO_DEMO_DRIFT_DURATION, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.94,
    transition: { duration: 0.22, ease: EASE_SMOOTH },
  },
}

/**
 * Chip that is sitting in the staging bank, waiting to be placed.
 * Fades out when it is about to drift.
 */
export const heroDemoBankChipVariants: Variants = {
  idle: { opacity: 1, scale: 1 },
  placing: {
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.18, ease: EASE_SMOOTH },
  },
}

/**
 * Container variant that staggers the initial reveal of the static tier rows.
 */
export const heroDemoRowRevealVariants: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: EASE_SMOOTH, delay },
  }),
}

export const slideUpVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_SMOOTH },
  },
}

export const likeHeartVariants: Variants = {
  idle: { scale: 1 },
  liked: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.18, ease: EASE_SMOOTH, times: [0, 0.4, 1] },
  },
}

export const hoverRevealVariants: Variants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.15, ease: EASE_SMOOTH } },
}

export const fadeSwapVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASE_SMOOTH },
  },
}

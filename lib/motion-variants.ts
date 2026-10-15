import type { Variants } from 'motion/react'

export const STAGGER_DELAY = 0.06
export const MAX_STAGGER = 4
export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const

export function staggerIndex(i: number): number {
  return Math.min(i, MAX_STAGGER - 1)
}

export const fadeUpVariants = {
  hidden: { opacity: 0, transform: 'translateY(6px)' },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transform: 'translateY(0)',
    transition: { duration: 0.24, ease: EASE_SMOOTH, delay },
  }),
} satisfies Variants

export const profileStepVariants = {
  hidden: { opacity: 0, transform: 'translateY(6px)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: { duration: 0.24, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-4px)',
    transition: { duration: 0.15, ease: EASE_SMOOTH },
  },
} satisfies Variants

export const profileDialogStepVariants = {
  hidden: { opacity: 0, transform: 'scale(0.97)' },
  visible: {
    opacity: 1,
    transform: 'scale(1)',
    transition: { duration: 0.2, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    transform: 'scale(0.97)',
    transition: { duration: 0.15, ease: EASE_SMOOTH },
  },
} satisfies Variants

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_DELAY },
  },
} satisfies Variants

export const pageTransitionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
} satisfies Variants

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

export const dragActiveVariants = {
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
} satisfies Variants

export const sidebarVariants: Variants = {
  expanded: { width: 240 },
  collapsed: { width: 56 },
}

export const sidebarLabelVariants: Variants = {
  expanded: { opacity: 1, transition: { duration: 0.2, ease: EASE_SMOOTH } },
  collapsed: { opacity: 0, transition: { duration: 0.1, ease: EASE_SMOOTH } },
}

export const cardLiftVariants = {
  hover: { y: -2, transition: springTransition },
  tap: { scale: 0.96, y: 0, transition: { duration: 0.1, ease: 'easeOut' } },
} satisfies Variants

/** Pause between sequential chip placements (seconds) */
export const HERO_DEMO_STEP_INTERVAL = 0.9

/** How long an autoplayed chip hangs lifted before it travels (seconds) */
export const HERO_DEMO_LIFT_PAUSE = 0.28

/** Spring that carries a chip between rows; slight overshoot reads as a snap */
export const heroDemoLayoutTransition = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 32,
  mass: 0.7,
}

export const heroDemoChipVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0,
    boxShadow: '0 0px 0px oklch(0 0 0 / 0%)',
    transition: { duration: 0.2, ease: EASE_SMOOTH },
  },
  lifted: {
    scale: 1.08,
    rotate: -2,
    boxShadow: '0 8px 24px oklch(0 0 0 / 40%)',
    transition: { duration: 0.16, ease: EASE_SMOOTH },
  },
}

/** Tier-colored wash on the row a dragged chip will land in */
export const heroDemoRowTargetVariants: Variants = {
  idle: { opacity: 0, transition: { duration: 0.2, ease: EASE_SMOOTH } },
  active: { opacity: 0.18, transition: { duration: 0.12, ease: EASE_SMOOTH } },
}

export const heroDemoTierLabelVariants: Variants = {
  idle: { scale: 1, transition: springTransition },
  active: { scale: 1.12, transition: springTransition },
}

export const heroDemoCollapseVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.28, ease: EASE_SMOOTH },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.28, ease: EASE_SMOOTH },
  },
}

/** Board settling into its exported-PNG frame */
export const heroDemoBoardVariants: Variants = {
  edit: {
    scale: 1,
    boxShadow: '0 0px 0px oklch(0 0 0 / 0%)',
    transition: { duration: 0.3, ease: EASE_SMOOTH },
  },
  export: {
    scale: [0.97, 1],
    boxShadow: '0 8px 24px oklch(0 0 0 / 40%)',
    transition: { duration: 0.45, ease: EASE_SMOOTH, delay: 0.12 },
  },
}

export const heroDemoBackdropVariants: Variants = {
  edit: { opacity: 0, transition: { duration: 0.2, ease: EASE_SMOOTH } },
  export: { opacity: 1, transition: { duration: 0.3, ease: EASE_SMOOTH } },
}

/** Light sweep across the board when the export preview develops */
export const heroDemoSheenVariants: Variants = {
  hidden: { x: '-110%', opacity: 0 },
  visible: {
    x: '110%',
    opacity: [0, 1, 0],
    transition: { duration: 0.7, ease: EASE_SMOOTH, delay: 0.18 },
  },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE_SMOOTH } },
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

export const hoverRevealVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.15, ease: EASE_SMOOTH } },
} satisfies Variants

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

export const iconSwapVariants: Variants = {
  hidden: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', duration: 0.3, bounce: 0 },
  },
  exit: {
    opacity: 0,
    scale: 0.25,
    filter: 'blur(4px)',
    transition: { type: 'spring', duration: 0.3, bounce: 0 },
  },
}

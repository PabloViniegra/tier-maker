import type { Variants } from 'motion/react'

export const STAGGER_DELAY = 0.06
export const MAX_STAGGER = 4

export function staggerIndex(i: number): number {
  return Math.min(i, MAX_STAGGER - 1)
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1], delay },
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

export const dragActiveVariants: Variants = {
  idle: { scale: 1, opacity: 1, boxShadow: 'none', zIndex: 0 },
  dragging: {
    scale: 1.08,
    opacity: 1,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 50,
    transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
  },
}

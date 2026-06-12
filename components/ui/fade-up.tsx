'use client'

import { motion } from 'motion/react'
import { fadeUpVariants } from '@/lib/motion-variants'

interface FadeUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
  onMount?: boolean
}

export function FadeUp({
  children,
  delay = 0,
  className,
  onMount = false,
}: FadeUpProps) {
  if (onMount) {
    return (
      <motion.div
        className={className}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={delay}
      >
        {children}
      </motion.div>
    )
  }
  return (
    <motion.div
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}

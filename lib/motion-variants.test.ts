import { describe, it, expect } from 'vitest'
import type { TargetAndTransition } from 'motion/react'
import {
  STAGGER_DELAY,
  MAX_STAGGER,
  staggerIndex,
  fadeUpVariants,
  staggerContainerVariants,
  pageTransitionVariants,
  dragActiveVariants,
  bentoIconFloatVariants,
  bentoSpotlightVariants,
  EASE_SMOOTH,
  bentoIconFloat,
  cardLiftVariants,
  hoverRevealVariants,
} from './motion-variants'

describe('constants', () => {
  it('STAGGER_DELAY is 0.06', () => {
    expect(STAGGER_DELAY).toBe(0.06)
  })

  it('MAX_STAGGER is 4', () => {
    expect(MAX_STAGGER).toBe(4)
  })
})

describe('staggerIndex', () => {
  it('returns index for i < MAX_STAGGER', () => {
    expect(staggerIndex(0)).toBe(0)
    expect(staggerIndex(2)).toBe(2)
    expect(staggerIndex(3)).toBe(3)
  })

  it('caps at MAX_STAGGER - 1 for large indexes', () => {
    expect(staggerIndex(4)).toBe(3)
    expect(staggerIndex(10)).toBe(3)
  })
})

describe('fadeUpVariants', () => {
  it('hidden state has opacity 0 and positive y offset', () => {
    const hidden = fadeUpVariants.hidden as TargetAndTransition
    expect(hidden.opacity).toBe(0)
    expect(hidden.y as number).toBeGreaterThan(0)
  })

  it('visible factory returns opacity 1 and y 0', () => {
    const visible = (
      fadeUpVariants.visible as (d: number) => TargetAndTransition
    )(0)
    expect(visible.opacity).toBe(1)
    expect(visible.y).toBe(0)
  })

  it('visible transition duration is within design spec (≤ 0.3s)', () => {
    const visible = (
      fadeUpVariants.visible as (d: number) => TargetAndTransition
    )(0)
    const transition = visible.transition as { duration: number }
    expect(transition.duration).toBeLessThanOrEqual(0.3)
    expect(transition.duration).toBeGreaterThan(0)
  })

  it('visible factory threads delay into transition', () => {
    const visible = (
      fadeUpVariants.visible as (d: number) => TargetAndTransition
    )(0.12)
    const transition = visible.transition as { delay: number }
    expect(transition.delay).toBe(0.12)
  })

  it('visible factory defaults delay to 0', () => {
    const visible = (
      fadeUpVariants.visible as (d?: number) => TargetAndTransition
    )()
    const transition = visible.transition as { delay: number }
    expect(transition.delay).toBe(0)
  })
})

describe('staggerContainerVariants', () => {
  it('visible staggers children by STAGGER_DELAY', () => {
    const visible = staggerContainerVariants.visible as TargetAndTransition
    const transition = visible.transition as { staggerChildren: number }
    expect(transition.staggerChildren).toBe(STAGGER_DELAY)
  })
})

describe('pageTransitionVariants', () => {
  it('hidden state is fully transparent', () => {
    const hidden = pageTransitionVariants.hidden as TargetAndTransition
    expect(hidden.opacity).toBe(0)
  })

  it('visible state is fully opaque', () => {
    const visible = pageTransitionVariants.visible as TargetAndTransition
    expect(visible.opacity).toBe(1)
  })

  it('exit state is fully transparent', () => {
    const exit = pageTransitionVariants.exit as TargetAndTransition
    expect(exit.opacity).toBe(0)
  })

  it('transition duration is fast (≤ 0.2s)', () => {
    const visible = pageTransitionVariants.visible as TargetAndTransition
    const transition = visible.transition as { duration: number }
    expect(transition.duration).toBeLessThanOrEqual(0.2)
  })
})

describe('dragActiveVariants', () => {
  it('dragging state scales up slightly', () => {
    const dragging = dragActiveVariants.dragging as TargetAndTransition
    expect(dragging.scale as number).toBeGreaterThan(1)
    expect(dragging.scale as number).toBeLessThanOrEqual(1.1)
  })

  it('idle state has scale 1 and full opacity', () => {
    const idle = dragActiveVariants.idle as TargetAndTransition
    expect(idle.scale).toBe(1)
    expect(idle.opacity).toBe(1)
  })
})

describe('hoverRevealVariants', () => {
  it('rest is hidden and hover is visible', () => {
    const rest = hoverRevealVariants.rest as TargetAndTransition
    const hover = hoverRevealVariants.hover as TargetAndTransition
    expect(rest.opacity).toBe(0)
    expect(hover.opacity).toBe(1)
  })
})

describe('bentoIconFloatVariants', () => {
  it('y keyframes oscillate from 0 to -3 and back', () => {
    const y = bentoIconFloatVariants.y as number[]
    expect(y).toEqual([0, -3, 0])
  })

  it('animation repeats infinitely', () => {
    const transition = bentoIconFloatVariants.transition as { repeat: number }
    expect(transition.repeat).toBe(Infinity)
  })

  it('duration is within design spec (≥ 3s, ≤ 6s)', () => {
    const transition = bentoIconFloatVariants.transition as { duration: number }
    expect(transition.duration).toBeGreaterThanOrEqual(3)
    expect(transition.duration).toBeLessThanOrEqual(6)
  })
})

describe('bentoSpotlightVariants', () => {
  it('non-hovered states (hidden, visible) are fully transparent', () => {
    const hidden = bentoSpotlightVariants.hidden as TargetAndTransition
    const visible = bentoSpotlightVariants.visible as TargetAndTransition
    expect(hidden.opacity).toBe(0)
    expect(visible.opacity).toBe(0)
  })

  it('hovered state is fully opaque', () => {
    const hovered = bentoSpotlightVariants.hovered as TargetAndTransition
    expect(hovered.opacity).toBe(1)
  })

  it('hovered transition duration is within design spec (≤ 0.6s)', () => {
    const hovered = bentoSpotlightVariants.hovered as TargetAndTransition
    const transition = hovered.transition as { duration: number }
    expect(transition.duration).toBeLessThanOrEqual(0.6)
    expect(transition.duration).toBeGreaterThan(0)
  })
})

describe('EASE_SMOOTH', () => {
  it('is a 4-element bezier array', () => {
    expect(EASE_SMOOTH).toHaveLength(4)
  })

  it('matches the project canonical smooth decelerate curve', () => {
    expect(EASE_SMOOTH).toEqual([0.16, 1, 0.3, 1])
  })
})

describe('bentoIconFloat', () => {
  it('returns y keyframes oscillating 0 → -3 → 0', () => {
    expect(bentoIconFloat(0).y).toEqual([0, -3, 0])
  })

  it('threads delay into transition', () => {
    const result = bentoIconFloat(0.5)
    expect((result.transition as { delay: number }).delay).toBe(0.5)
  })

  it('defaults delay to 0', () => {
    const result = bentoIconFloat()
    expect((result.transition as { delay: number }).delay).toBe(0)
  })

  it('repeats infinitely', () => {
    const result = bentoIconFloat(0)
    expect((result.transition as { repeat: number }).repeat).toBe(Infinity)
  })
})

describe('cardLiftVariants', () => {
  it('hover state lifts card up (negative y)', () => {
    const hover = cardLiftVariants.hover as TargetAndTransition
    expect(hover.y as number).toBeLessThan(0)
  })

  it('tap state shrinks card slightly', () => {
    const tap = cardLiftVariants.tap as TargetAndTransition
    expect(tap.scale as number).toBeLessThan(1)
    expect(tap.scale as number).toBeGreaterThan(0.95)
  })

  it('tap state resets y to 0', () => {
    const tap = cardLiftVariants.tap as TargetAndTransition
    expect(tap.y).toBe(0)
  })
})

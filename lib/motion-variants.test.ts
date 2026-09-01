import { describe, it, expect } from 'vitest'
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
    expect(fadeUpVariants.hidden.opacity).toBe(0)
    expect(fadeUpVariants.hidden.y).toBeGreaterThan(0)
  })

  it('visible factory returns opacity 1 and y 0', () => {
    const visible = fadeUpVariants.visible(0)
    expect(visible.opacity).toBe(1)
    expect(visible.y).toBe(0)
  })

  it('visible transition duration is within design spec (≤ 0.3s)', () => {
    const { duration } = fadeUpVariants.visible(0).transition
    expect(duration).toBeLessThanOrEqual(0.3)
    expect(duration).toBeGreaterThan(0)
  })

  it('visible factory threads delay into transition', () => {
    expect(fadeUpVariants.visible(0.12).transition.delay).toBe(0.12)
  })

  it('visible factory defaults delay to 0', () => {
    expect(fadeUpVariants.visible().transition.delay).toBe(0)
  })
})

describe('staggerContainerVariants', () => {
  it('visible staggers children by STAGGER_DELAY', () => {
    expect(staggerContainerVariants.visible.transition.staggerChildren).toBe(
      STAGGER_DELAY
    )
  })
})

describe('pageTransitionVariants', () => {
  it('hidden state is fully transparent', () => {
    expect(pageTransitionVariants.hidden.opacity).toBe(0)
  })

  it('visible state is fully opaque', () => {
    expect(pageTransitionVariants.visible.opacity).toBe(1)
  })

  it('exit state is fully transparent', () => {
    expect(pageTransitionVariants.exit.opacity).toBe(0)
  })

  it('transition duration is fast (≤ 0.2s)', () => {
    expect(pageTransitionVariants.visible.transition.duration).toBeLessThanOrEqual(
      0.2
    )
  })
})

describe('dragActiveVariants', () => {
  it('dragging state scales up slightly', () => {
    expect(dragActiveVariants.dragging.scale).toBeGreaterThan(1)
    expect(dragActiveVariants.dragging.scale).toBeLessThanOrEqual(1.1)
  })

  it('idle state has scale 1 and full opacity', () => {
    expect(dragActiveVariants.idle.scale).toBe(1)
    expect(dragActiveVariants.idle.opacity).toBe(1)
  })
})

describe('hoverRevealVariants', () => {
  it('rest is hidden and hover is visible', () => {
    expect(hoverRevealVariants.rest.opacity).toBe(0)
    expect(hoverRevealVariants.hover.opacity).toBe(1)
  })
})

describe('bentoIconFloatVariants', () => {
  it('y keyframes oscillate from 0 to -3 and back', () => {
    expect(bentoIconFloatVariants.y).toEqual([0, -3, 0])
  })

  it('animation repeats infinitely', () => {
    expect(bentoIconFloatVariants.transition.repeat).toBe(Infinity)
  })

  it('duration is within design spec (≥ 3s, ≤ 6s)', () => {
    expect(bentoIconFloatVariants.transition.duration).toBeGreaterThanOrEqual(3)
    expect(bentoIconFloatVariants.transition.duration).toBeLessThanOrEqual(6)
  })
})

describe('bentoSpotlightVariants', () => {
  it('non-hovered states (hidden, visible) are fully transparent', () => {
    expect(bentoSpotlightVariants.hidden.opacity).toBe(0)
    expect(bentoSpotlightVariants.visible.opacity).toBe(0)
  })

  it('hovered state is fully opaque', () => {
    expect(bentoSpotlightVariants.hovered.opacity).toBe(1)
  })

  it('hovered transition duration is within design spec (≤ 0.6s)', () => {
    const { duration } = bentoSpotlightVariants.hovered.transition
    expect(duration).toBeLessThanOrEqual(0.6)
    expect(duration).toBeGreaterThan(0)
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
    expect(bentoIconFloat(0.5).transition.delay).toBe(0.5)
  })

  it('defaults delay to 0', () => {
    expect(bentoIconFloat().transition.delay).toBe(0)
  })

  it('repeats infinitely', () => {
    expect(bentoIconFloat(0).transition.repeat).toBe(Infinity)
  })
})

describe('cardLiftVariants', () => {
  it('hover state lifts card up (negative y)', () => {
    expect(cardLiftVariants.hover.y).toBeLessThan(0)
  })

  it('tap state shrinks card slightly', () => {
    expect(cardLiftVariants.tap.scale).toBeLessThan(1)
    expect(cardLiftVariants.tap.scale).toBeGreaterThan(0.95)
  })

  it('tap state resets y to 0', () => {
    expect(cardLiftVariants.tap.y).toBe(0)
  })
})

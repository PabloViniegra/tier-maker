import { describe, it, expect } from 'vitest'
import {
  STAGGER_DELAY,
  MAX_STAGGER,
  staggerIndex,
  fadeUpVariants,
  staggerContainerVariants,
  pageTransitionVariants,
  dragActiveVariants,
  EASE_SMOOTH,
  cardLiftVariants,
  hoverRevealVariants,
  profileDialogStepVariants,
  profileStepVariants,
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
  it('uses full transform strings for the vertical offset', () => {
    expect(fadeUpVariants.hidden.opacity).toBe(0)
    const visible = fadeUpVariants.visible(0)
    expect(visible.opacity).toBe(1)
    expect(fadeUpVariants.hidden.transform).toBe('translateY(6px)')
    expect(visible.transform).toBe('translateY(0)')
    expect(fadeUpVariants.hidden).not.toHaveProperty('y')
    expect(visible).not.toHaveProperty('y')
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

describe('profileStepVariants', () => {
  it('uses full transforms for entry and exit', () => {
    expect(profileStepVariants.hidden).toMatchObject({
      opacity: 0,
      transform: 'translateY(6px)',
    })
    expect(profileStepVariants.visible).toMatchObject({
      opacity: 1,
      transform: 'translateY(0)',
    })
    expect(profileStepVariants.exit).toMatchObject({
      opacity: 0,
      transform: 'translateY(-4px)',
    })
  })

  it('uses the profile transition timings', () => {
    expect(profileStepVariants.visible.transition).toMatchObject({
      duration: 0.24,
      ease: EASE_SMOOTH,
    })
    expect(profileStepVariants.exit.transition).toMatchObject({
      duration: 0.15,
      ease: EASE_SMOOTH,
    })
  })
})

describe('profileDialogStepVariants', () => {
  it('uses a subtle scale with opacity for dialog step swaps', () => {
    expect(profileDialogStepVariants.hidden).toMatchObject({
      opacity: 0,
      transform: 'scale(0.97)',
    })
    expect(profileDialogStepVariants.visible).toMatchObject({
      opacity: 1,
      transform: 'scale(1)',
    })
    expect(profileDialogStepVariants.exit).toMatchObject({
      opacity: 0,
      transform: 'scale(0.97)',
    })
  })

  it('uses the dialog step transition timings', () => {
    expect(profileDialogStepVariants.visible.transition).toMatchObject({
      duration: 0.2,
      ease: EASE_SMOOTH,
    })
    expect(profileDialogStepVariants.exit.transition).toMatchObject({
      duration: 0.15,
      ease: EASE_SMOOTH,
    })
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

describe('EASE_SMOOTH', () => {
  it('is a 4-element bezier array', () => {
    expect(EASE_SMOOTH).toHaveLength(4)
  })

  it('matches the project canonical smooth decelerate curve', () => {
    expect(EASE_SMOOTH).toEqual([0.16, 1, 0.3, 1])
  })
})

describe('cardLiftVariants', () => {
  it('hover state lifts card up (negative y)', () => {
    expect(cardLiftVariants.hover.y).toBeLessThan(0)
  })

  it('tap state shrinks card slightly', () => {
    expect(cardLiftVariants.tap.scale).toBe(0.96)
  })

  it('tap state resets y to 0', () => {
    expect(cardLiftVariants.tap.y).toBe(0)
  })
})

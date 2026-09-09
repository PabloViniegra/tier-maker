import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button'

describe('buttonVariants', () => {
  it('limits transitions to explicit interactive properties', () => {
    const classes = buttonVariants()

    expect(classes).toContain(
      'transition-[transform,opacity,background-color,border-color,color]'
    )
    expect(classes).not.toContain('transition-all')
  })
})

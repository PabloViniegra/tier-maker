import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('disables pulse animation when motion is reduced', () => {
    const { container } = render(<Skeleton />)

    expect(container.firstElementChild).toHaveClass(
      'animate-pulse',
      'motion-reduce:animate-none'
    )
  })
})

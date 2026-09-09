import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Loading from './loading'

describe('Profile loading state', () => {
  it('announces that the profile is loading', () => {
    render(<Loading />)

    expect(screen.getByLabelText(/loading profile/i)).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })
})

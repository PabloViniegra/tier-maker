import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Loading from './loading'

describe('Profile loading state', () => {
  it('announces that the profile is loading', () => {
    render(<Loading />)

    const status = screen.getByLabelText(/loading profile/i)
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveClass('max-w-3xl', 'p-4', 'sm:p-6')
  })
})

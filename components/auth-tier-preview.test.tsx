import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AuthTierPreview } from '@/components/auth-tier-preview'

describe('AuthTierPreview', () => {
  it('shows a finished 2010s sci-fi ranking', () => {
    render(<AuthTierPreview />)
    expect(screen.getByText('Best sci-fi of the 2010s')).toBeInTheDocument()
    expect(screen.getByText('Interstellar')).toBeInTheDocument()
    expect(screen.getByText('Arrival')).toBeInTheDocument()
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument()
    expect(screen.queryByText('The Menu')).not.toBeInTheDocument()
  })

  it('keeps a compact preview to two rows', () => {
    render(<AuthTierPreview compact />)
    expect(screen.getByText('Interstellar')).toBeInTheDocument()
    expect(screen.getByText('Arrival')).toBeInTheDocument()
    expect(screen.queryByText('Her')).not.toBeInTheDocument()
    expect(screen.queryByText('Gravity')).not.toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TierRowsBackground } from '@/components/tier-rows-background'

describe('TierRowsBackground', () => {
  it('renders a faint motif without ranked items', () => {
    const { container } = render(<TierRowsBackground />)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('Interstellar')).not.toBeInTheDocument()
    expect(container.querySelector('[class*="opacity-[0.18]"]')).not.toBeNull()
  })
})

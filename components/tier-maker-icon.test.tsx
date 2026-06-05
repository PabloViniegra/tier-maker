import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TierMakerIcon } from './tier-maker-icon'

describe('TierMakerIcon', () => {
  it('renders exactly 3 rect elements', () => {
    const { container } = render(<TierMakerIcon />)
    const rects = container.querySelectorAll('rect')
    expect(rects).toHaveLength(3)
  })

  it('applies aria-hidden when passed', () => {
    render(<TierMakerIcon aria-hidden="true" />)
    const svg = screen.getByTestId('tier-maker-icon')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not set aria-hidden by default', () => {
    render(<TierMakerIcon />)
    const svg = screen.getByTestId('tier-maker-icon')
    expect(svg).not.toHaveAttribute('aria-hidden')
  })

  it('applies size prop to width and height', () => {
    render(<TierMakerIcon size={16} />)
    const svg = screen.getByTestId('tier-maker-icon')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })

  it('defaults to size 20', () => {
    render(<TierMakerIcon />)
    const svg = screen.getByTestId('tier-maker-icon')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })
})

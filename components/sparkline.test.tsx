import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Sparkline } from './sparkline'

describe('Sparkline', () => {
  it('renders an SVG for a valid series', () => {
    const { container } = render(<Sparkline series={[1, 3, 2, 5, 4]} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders nothing for an empty series', () => {
    const { container } = render(<Sparkline series={[]} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders a flat baseline for a single point', () => {
    const { container } = render(<Sparkline series={[42]} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not crash when all values are equal (no division by zero)', () => {
    expect(() => render(<Sparkline series={[5, 5, 5, 5]} />)).not.toThrow()
  })

  it('applies custom width and height', () => {
    const { container } = render(
      <Sparkline series={[1, 2, 3]} width={120} height={40} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '120')
    expect(svg).toHaveAttribute('height', '40')
  })

  it('applies custom className to the SVG', () => {
    const { container } = render(
      <Sparkline series={[1, 2, 3]} className="my-class" />
    )
    expect(container.querySelector('svg')).toHaveClass('my-class')
  })

  it('renders a polyline path element for the line', () => {
    const { container } = render(<Sparkline series={[1, 3, 2]} />)
    // Should have a path or polyline representing the line
    const line = container.querySelector('polyline, path')
    expect(line).toBeInTheDocument()
  })
})

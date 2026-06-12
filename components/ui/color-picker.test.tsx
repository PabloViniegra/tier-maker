import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ColorPicker,
  ColorPickerHue,
  ColorPickerSelection,
} from './color-picker'

function ControlledPicker({
  value = '#ff0000',
  onChange,
}: {
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <ColorPicker
      value={value}
      onChange={(next) => {
        onChange?.(next)
      }}
    >
      <ColorPickerSelection data-testid="selection" />
      <ColorPickerHue />
    </ColorPicker>
  )
}

describe('ColorPicker', () => {
  it('renders selection surface and hue slider with the default color', () => {
    render(<ControlledPicker value="#ff0000" />)
    expect(screen.getByTestId('selection')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /hue/i })).toBeInTheDocument()
  })

  it('calls onChange with a hex string when the user drags the selection surface', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ControlledPicker value="#ff0000" onChange={onChange} />)

    const surface = screen.getByTestId('selection')
    await act(async () => {
      await user.pointer({
        target: surface,
        keys: '[MouseLeft>]',
        coords: { clientX: 10, clientY: 10 },
      })
    })

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1)?.[0] as string
    expect(lastCall).toMatch(/^#/)
  })

  it('is a controlled component — external value updates are reflected in the hue', () => {
    const { container, rerender } = render(<ControlledPicker value="#ff0000" />)
    rerender(<ControlledPicker value="#0000ff" />)
    const hueInput = container.querySelector<HTMLInputElement>(
      'input[type="range"]'
    )
    expect(hueInput).not.toBeNull()
    expect(hueInput?.value).toBe('240')
  })
})

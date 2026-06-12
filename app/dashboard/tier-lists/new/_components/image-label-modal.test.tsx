import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageLabelModal } from './image-label-modal'

function makeFile(name = 'cake.png'): File {
  return new File([''], name, { type: 'image/png' })
}

describe('ImageLabelModal', () => {
  it('renders one input per file', () => {
    const files = [makeFile('a.png'), makeFile('b.png')]
    render(
      <ImageLabelModal files={files} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('shows the file name as input placeholder', () => {
    render(
      <ImageLabelModal
        files={[makeFile('strawberry-cake.png')]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(
      screen.getByPlaceholderText('strawberry-cake.png')
    ).toBeInTheDocument()
  })

  it('confirm button is disabled when any label is empty', () => {
    const files = [makeFile('a.png'), makeFile('b.png')]
    render(
      <ImageLabelModal files={files} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'A cake' } })
    // second input still empty
    expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled()
  })

  it('confirm button is enabled when all labels are filled', () => {
    const files = [makeFile('a.png'), makeFile('b.png')]
    render(
      <ImageLabelModal files={files} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'A cake' } })
    fireEvent.change(inputs[1], { target: { value: 'B cake' } })
    expect(screen.getByRole('button', { name: /upload/i })).not.toBeDisabled()
  })

  it('calls onConfirm with {file, label}[] pairs when confirmed', () => {
    const onConfirm = vi.fn()
    const files = [makeFile('tart.png'), makeFile('pie.png')]
    render(
      <ImageLabelModal files={files} onConfirm={onConfirm} onCancel={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Lemon tart' } })
    fireEvent.change(inputs[1], { target: { value: 'Apple pie' } })
    fireEvent.click(screen.getByRole('button', { name: /upload/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onConfirm).toHaveBeenCalledWith([
      { file: files[0], label: 'Lemon tart' },
      { file: files[1], label: 'Apple pie' },
    ])
  })

  it('calls onCancel when cancel button is clicked, without calling onConfirm', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ImageLabelModal
        files={[makeFile()]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('enforces max label length of 50 characters on inputs', () => {
    render(
      <ImageLabelModal
        files={[makeFile()]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '50')
  })
})

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageLabelModal } from './image-label-modal'

function makeFile(name = 'cake.png'): File {
  return new File([''], name, { type: 'image/png' })
}

describe('ImageLabelModal', () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('renders one input per file', () => {
    const files = [makeFile('a.png'), makeFile('b.png')]
    render(
      <ImageLabelModal files={files} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('prefills each label from its file name', () => {
    render(
      <ImageLabelModal
        files={[makeFile('strawberry-cake.png')]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox')).toHaveValue('strawberry cake')
    expect(screen.getByRole('button', { name: /add image/i })).toBeEnabled()
  })

  it('falls back to the file name when a label is cleared', () => {
    const onConfirm = vi.fn()
    const files = [makeFile('a.png'), makeFile('b.png')]
    render(
      <ImageLabelModal files={files} onConfirm={onConfirm} onCancel={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'A cake' } })
    fireEvent.change(inputs[1], { target: { value: '  ' } })
    fireEvent.click(screen.getByRole('button', { name: /add 2 images/i }))
    expect(onConfirm).toHaveBeenCalledWith([
      { file: files[0], label: 'A cake' },
      { file: files[1], label: 'b' },
    ])
  })

  it('submits with Enter from a label input', () => {
    const onConfirm = vi.fn()
    render(
      <ImageLabelModal
        files={[makeFile('pie.png')]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)
    expect(onConfirm).toHaveBeenCalledWith([
      { file: expect.any(File), label: 'pie' },
    ])
  })

  it('names each input after its file', () => {
    render(
      <ImageLabelModal
        files={[makeFile('tart.png')]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(
      screen.getByRole('textbox', { name: 'Label for tart.png' })
    ).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: /add 2 images/i }))
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

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useTierEditor } from '@/lib/stores/tier-editor'

import { MetadataPanel } from './metadata-panel'

describe('MetadataPanel — collapsible description', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('description field is not accessible on mount', () => {
    render(<MetadataPanel categoryPresets={[]} userPresets={[]} />)
    expect(
      screen.queryByRole('textbox', { name: /description/i })
    ).not.toBeInTheDocument()
  })

  it('description field appears after expanding "More details"', () => {
    render(<MetadataPanel categoryPresets={[]} userPresets={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /more details/i }))
    expect(
      screen.getByRole('textbox', { name: /description/i })
    ).toBeInTheDocument()
  })
})

describe('MetadataPanel — visibility', () => {
  beforeEach(() => {
    useTierEditor.getState().reset()
  })

  it('is public by default', () => {
    render(<MetadataPanel categoryPresets={[]} userPresets={[]} />)
    expect(screen.getByRole('radio', { name: /public/i })).toBeChecked()
  })

  it('marks the tier list private when Private is selected', () => {
    render(<MetadataPanel categoryPresets={[]} userPresets={[]} />)
    fireEvent.click(screen.getByRole('radio', { name: /private/i }))
    expect(useTierEditor.getState().metadata.isPublic).toBe(false)
  })
})

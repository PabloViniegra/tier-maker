import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TermsModal } from './terms-modal'

describe('TermsModal', () => {
  it('renders a trigger labelled "Terms of Service"', () => {
    render(<TermsModal />)
    expect(screen.getByRole('button', { name: /terms of service/i })).toBeInTheDocument()
  })

  it('does not show the modal content until the trigger is activated', () => {
    render(<TermsModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the dialog and shows the terms content when the trigger is activated', async () => {
    const user = userEvent.setup()
    render(<TermsModal />)
    await user.click(screen.getByRole('button', { name: /terms of service/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /terms of service/i })).toBeInTheDocument()
    expect(within(dialog).getByText(/^last updated/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /acceptance of terms/i })).toBeInTheDocument()
  })

  it('closes the dialog when the close button is activated', async () => {
    const user = userEvent.setup()
    render(<TermsModal />)
    await user.click(screen.getByRole('button', { name: /terms of service/i }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

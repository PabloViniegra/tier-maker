import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PrivacyModal } from './privacy-modal'

describe('PrivacyModal', () => {
  it('renders a trigger labelled "Privacy Policy"', () => {
    render(<PrivacyModal />)
    expect(
      screen.getByRole('button', { name: /privacy policy/i })
    ).toBeInTheDocument()
  })

  it('does not show the modal content until the trigger is activated', () => {
    render(<PrivacyModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the dialog and shows the privacy content when the trigger is activated', async () => {
    const user = userEvent.setup()
    render(<PrivacyModal />)
    await user.click(screen.getByRole('button', { name: /privacy policy/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(
      within(dialog).getByRole('heading', { name: /privacy policy/i })
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/^last updated/i)).toBeInTheDocument()
    expect(
      within(dialog).getByRole('heading', { name: /information we collect/i })
    ).toBeInTheDocument()
  })

  it('closes the dialog when the close button is activated', async () => {
    const user = userEvent.setup()
    render(<PrivacyModal />)
    await user.click(screen.getByRole('button', { name: /privacy policy/i }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

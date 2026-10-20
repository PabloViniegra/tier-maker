import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { reportTierList } from '@/app/explore/_actions/report-tier-list'
import { asMock } from '@/test/as-mock'
import { ReportButton } from './report-button'

// eslint-disable-next-line anti-slop/no-module-mocking -- Server actions cannot run in jsdom.
vi.mock('@/app/explore/_actions/report-tier-list', () => ({
  reportTierList: vi.fn(),
}))

function renderButton(isAuthenticated = true) {
  return render(
    <TooltipProvider>
      <ReportButton templateId="tpl-1" isAuthenticated={isAuthenticated} />
    </TooltipProvider>
  )
}

describe('ReportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends anonymous visitors to log in', () => {
    renderButton(false)
    expect(
      screen.getByRole('link', { name: /report tier list/i })
    ).toHaveAttribute('href', '/login')
  })

  it('requires a reason before submitting', () => {
    renderButton()
    fireEvent.click(screen.getByRole('button', { name: /report tier list/i }))
    expect(screen.getByRole('button', { name: /send report/i })).toBeDisabled()
  })

  it('submits the selected reason and details', async () => {
    asMock(reportTierList).mockResolvedValue({ status: 'reported' })
    renderButton()

    fireEvent.click(screen.getByRole('button', { name: /report tier list/i }))
    fireEvent.click(screen.getByRole('radio', { name: /spam/i }))
    fireEvent.change(screen.getByRole('textbox', { name: /details/i }), {
      target: { value: 'Bot account' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send report/i }))

    await waitFor(() =>
      expect(reportTierList).toHaveBeenCalledWith({
        templateId: 'tpl-1',
        reason: 'spam',
        details: 'Bot account',
      })
    )
    expect(toast.success).toHaveBeenCalled()
  })

  it('shows an inline error and keeps the dialog open when the report fails', async () => {
    asMock(reportTierList).mockRejectedValue(new Error('boom'))
    renderButton()

    fireEvent.click(screen.getByRole('button', { name: /report tier list/i }))
    fireEvent.click(screen.getByRole('radio', { name: /copyright/i }))
    fireEvent.click(screen.getByRole('button', { name: /send report/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not send the report/i
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

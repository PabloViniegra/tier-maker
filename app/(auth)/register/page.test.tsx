import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import RegisterPage from './page'

describe('RegisterPage', () => {
  it('names the task and why an account exists', () => {
    render(<RegisterPage />)
    expect(
      screen.getByRole('heading', { name: /create an account/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/save the lists you make/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/enter your details/i)).not.toBeInTheDocument()
  })

  it('links to sign in', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login'
    )
  })
})

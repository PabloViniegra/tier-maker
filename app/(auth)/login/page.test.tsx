import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import LoginPage from './page'

describe('LoginPage', () => {
  it('names the task and why an account exists', () => {
    render(<LoginPage />)
    expect(
      screen.getByRole('heading', { name: /sign in/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/access lists you've saved/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/credentials/i)).not.toBeInTheDocument()
  })

  it('links to registration', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/register'
    )
  })
})

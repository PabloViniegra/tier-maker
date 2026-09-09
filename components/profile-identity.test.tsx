import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ProfileIdentity } from './profile-identity'

describe('ProfileIdentity', () => {
  it('renders name, email, and member since date', () => {
    render(
      <ProfileIdentity
        name="Pablo García"
        email="pablo@example.com"
        createdAt={new Date('2026-01-15T00:00:00Z')}
      />
    )

    expect(screen.getByText('Pablo García')).toBeInTheDocument()
    expect(screen.getByText('pablo@example.com')).toBeInTheDocument()
    expect(screen.getByText(/january 15, 2026/i)).toBeInTheDocument()
  })

  it('shows email and google login method badges', () => {
    render(
      <ProfileIdentity
        name="Pablo García"
        email="pablo@example.com"
        createdAt={new Date('2026-01-15T00:00:00Z')}
        providers={['credential', 'google']}
      />
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('falls back to email initials when name is empty', () => {
    render(
      <ProfileIdentity
        name=""
        email="pablo@example.com"
        createdAt={new Date('2026-01-15T00:00:00Z')}
      />
    )

    expect(screen.getByText('P')).toBeInTheDocument()
  })
})

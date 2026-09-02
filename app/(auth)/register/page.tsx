import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create a free Tier Maker account and start building and sharing tier lists instantly.',
}

export default function RegisterPage() {
  return <AuthForm mode="register" />
}

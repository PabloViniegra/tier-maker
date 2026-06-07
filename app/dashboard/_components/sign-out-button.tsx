'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SignOutButton({
  className,
  iconOnly,
  ...props
}: {
  className?: string
  iconOnly?: boolean
} & ComponentPropsWithoutRef<'button'>) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant='outline' size='sm' className={className} onClick={handleSignOut} {...props}>
      <LogOut size={14} strokeWidth={1.5} />
      {!iconOnly && 'Sign out'}
    </Button>
  )
}

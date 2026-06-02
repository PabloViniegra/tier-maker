'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant='outline' size='sm' onClick={handleSignOut}>
      <LogOut size={14} strokeWidth={1.5} />
      Sign out
    </Button>
  )
}

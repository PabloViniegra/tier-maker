'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15',
        className
      )}
      onClick={handleSignOut}
      {...props}
    >
      <LogOut size={14} strokeWidth={1.5} />
      {!iconOnly && 'Sign out'}
    </Button>
  )
}

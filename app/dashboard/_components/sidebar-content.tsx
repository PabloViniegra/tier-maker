'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Layers, LayoutDashboard, List, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { springTransition } from '@/lib/motion-variants'
import { SignOutButton } from './sign-out-button'
import { ThemeToggleButton } from './theme-toggle-button'

export type SidebarUser = {
  name: string | null
  email: string
  image?: string | null
}

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tier Lists', href: '/dashboard/tier-lists', icon: List },
]

export function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return email[0].toUpperCase()
}

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-2">
      <Layers size={16} strokeWidth={1.5} className="text-primary" />
      <span className="font-heading text-sm font-semibold tracking-tight">
        tier-maker
      </span>
    </div>
  )
}

export function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active-bg"
                className="absolute inset-0 rounded-md bg-muted"
                transition={springTransition}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </span>
          </Link>
        )
      })}

      <div className="my-1">
        <Separator />
      </div>

      <Link
        href="/dashboard/tier-lists/new"
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'w-full justify-start gap-2'
        )}
      >
        <Plus size={14} strokeWidth={1.5} />
        Create Tier List
      </Link>
    </nav>
  )
}

export function SidebarUserProfile({ user }: { user: SidebarUser }) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(user.name, user.email)}
        </div>
        <div className="min-w-0 flex-1">
          {user.name && (
            <p className="truncate text-xs font-medium text-foreground">
              {user.name}
            </p>
          )}
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <ThemeToggleButton />
        <SignOutButton className="flex-1 w-full" />
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Compass, LayoutDashboard, List, Plus } from 'lucide-react'
import { TierMakerIcon } from '@/components/tier-maker-icon'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  { label: 'Explore', href: '/dashboard/explore', icon: Compass },
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
  return (email[0] ?? '').toUpperCase()
}

export function SidebarLogo() {
  return <TierMakerIcon size={20} aria-hidden="true" />
}

export function SidebarNav({
  pathname,
  collapsed,
}: {
  pathname: string
  collapsed: boolean
}) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          const linkClassName = cn(
            'relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
            collapsed && 'justify-center px-0',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          )

          const linkInner = (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-md bg-muted"
                  transition={springTransition}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon size={14} strokeWidth={1.5} />
                {!collapsed && (
                  <span data-testid="nav-label" className="whitespace-nowrap">
                    {label}
                  </span>
                )}
              </span>
            </>
          )

          if (collapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={href}
                      prefetch={true}
                      aria-label={label}
                      className={linkClassName}
                    >
                      {linkInner}
                    </Link>
                  }
                />
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          }

          return (
            <Link key={href} href={href} prefetch={true} className={linkClassName}>
              {linkInner}
            </Link>
          )
        })}

        <div className="my-1">
          <Separator />
        </div>

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  data-testid="create-tier-list-trigger"
                  href="/dashboard/tier-lists/new"
                  prefetch={true}
                  aria-label="Create Tier List"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'w-full justify-center'
                  )}
                >
                  <Plus size={14} strokeWidth={1.5} />
                </Link>
              }
            />
            <TooltipContent side="right">Create Tier List</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/dashboard/tier-lists/new"
            prefetch={true}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full justify-start gap-2'
            )}
          >
            <Plus size={14} strokeWidth={1.5} />
            Create Tier List
          </Link>
        )}
    </nav>
  )
}

export function SidebarUserProfile({
  user,
  collapsed,
}: {
  user: SidebarUser
  collapsed: boolean
}) {
  return (
    <div className="border-t border-border p-3">
      <div
        className={cn(
          'flex items-start gap-2',
          collapsed && 'justify-center'
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(user.name, user.email)}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 overflow-hidden">
            {user.name && (
              <p className="truncate text-xs font-medium text-foreground">
                {user.name}
              </p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        )}
      </div>
      <div
        className={cn(
          'mt-2 flex items-center gap-1',
          collapsed && 'flex-col'
        )}
      >
        <ThemeToggleButton />
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <SignOutButton iconOnly aria-label="Sign out" />
              }
            />
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <SignOutButton className="flex-1 w-full" />
        )}
      </div>
    </div>
  )
}

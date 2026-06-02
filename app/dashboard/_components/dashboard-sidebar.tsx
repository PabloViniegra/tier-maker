'use client'

import { usePathname } from 'next/navigation'
import {
  SidebarLogo,
  SidebarNav,
  SidebarUserProfile,
  type SidebarUser,
} from './sidebar-content'

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <SidebarLogo />
      </div>
      <SidebarNav pathname={pathname} />
      <SidebarUserProfile user={user} />
    </aside>
  )
}

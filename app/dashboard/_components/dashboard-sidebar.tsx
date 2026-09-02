'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sidebarVariants, springTransition } from '@/lib/motion-variants'
import { useUIStore } from '@/lib/stores/ui'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  SidebarLogo,
  SidebarNav,
  SidebarUserProfile,
  type SidebarUser,
} from './sidebar-content'

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  useEffect(() => {
    void useUIStore.persist.rehydrate()
  }, [])

  return (
    <TooltipProvider>
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        initial={false}
        transition={springTransition}
        className="relative hidden shrink-0 flex-col overflow-visible border-r border-border bg-surface md:flex"
      >
        {/* inner wrapper clips content during animation; aside stays overflow-visible for toggle */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              'flex h-12 items-center border-b border-border px-4',
              collapsed ? 'justify-center px-0' : 'gap-2'
            )}
          >
            <SidebarLogo showWordmark={!collapsed} />
          </div>

          <SidebarNav pathname={pathname} collapsed={collapsed} />
          <SidebarUserProfile user={user} collapsed={collapsed} />
        </div>

        {/* right-edge collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="absolute top-2.5 -right-3 z-10 flex size-7 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground shadow-overlay transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={springTransition}
            className="flex items-center justify-center"
          >
            <ChevronLeft size={12} strokeWidth={2} />
          </motion.span>
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}

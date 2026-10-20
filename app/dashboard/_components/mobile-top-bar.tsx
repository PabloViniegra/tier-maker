'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  SidebarLogo,
  SidebarNav,
  SidebarUserProfile,
  type SidebarUser,
} from './sidebar-content'

export function MobileTopBar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  // Remembering where the sheet was opened closes it when a link changes the route.
  const [openedAt, setOpenedAt] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
      <Sheet
        open={openedAt === pathname}
        onOpenChange={(open) => setOpenedAt(open ? pathname : null)}
      >
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'size-11 p-0'
          )}
          aria-label="Open navigation"
        >
          <Menu size={16} strokeWidth={1.5} aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex !w-[240px] flex-col border-border bg-surface p-0"
        >
          <SheetHeader className="flex h-12 flex-row items-center gap-2 space-y-0 border-b border-border px-4">
            <SheetTitle className="flex items-center gap-0">
              <span className="sr-only">Navigation</span>
              <span aria-hidden="true">
                <SidebarLogo showWordmark />
              </span>
            </SheetTitle>
          </SheetHeader>
          <SidebarNav pathname={pathname} collapsed={false} />
          <SidebarUserProfile user={user} collapsed={false} />
        </SheetContent>
      </Sheet>

      <SidebarLogo showWordmark />
    </header>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { DashboardSidebar } from './_components/dashboard-sidebar'
import { MobileTopBar } from './_components/mobile-top-bar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <DashboardSidebar user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileTopBar user={user} />
        <main id="main-content" className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

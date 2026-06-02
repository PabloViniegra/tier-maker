import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardSidebar } from './_components/dashboard-sidebar'
import { MobileTopBar } from './_components/mobile-top-bar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <DashboardSidebar user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileTopBar user={user} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

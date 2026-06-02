import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SignOutButton } from './_components/sign-out-button'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { user } = session
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className='flex min-h-[100dvh] items-center justify-center bg-background p-6'>
      <div className='w-full max-w-sm'>
        <div className='rounded-xl border border-border bg-card p-6 shadow-overlay'>
          {/* Avatar */}
          <div className='flex items-center gap-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-semibold text-primary'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              {user.name && (
                <p className='truncate text-sm font-medium text-foreground'>
                  {user.name}
                </p>
              )}
              <p className='truncate text-xs text-muted-foreground'>
                {user.email}
              </p>
            </div>
          </div>

          <div className='my-4 border-t border-border' />

          <div className='flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>Signed in</p>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}

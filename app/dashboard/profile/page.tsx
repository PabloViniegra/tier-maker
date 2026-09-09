import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ProfileActivity } from '@/components/profile-activity'
import { ProfileIdentity } from '@/components/profile-identity'
import { ProfileDeleteDialog } from '@/components/profile-delete-dialog'
import { ProfilePasswordForm } from '@/components/profile-password-form'
import { FadeUp } from '@/components/ui/fade-up'
import { getProfileStats } from '@/lib/queries/tier-templates'
import { getUserProviderIds } from '@/lib/queries/user-accounts'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { user } = session
  const [stats, providers] = await Promise.all([
    getProfileStats(user.id),
    getUserProviderIds(user.id),
  ])
  const hasCredential = providers.includes('credential')

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <FadeUp onMount>
        <h1 className="font-heading text-[2rem] leading-tight">Profile</h1>
      </FadeUp>
      <FadeUp delay={0.06} onMount>
        <ProfileIdentity
          name={user.name}
          email={user.email}
          createdAt={user.createdAt}
          providers={providers}
        />
      </FadeUp>
      <FadeUp delay={0.12} onMount>
        <ProfileActivity stats={stats} />
      </FadeUp>
      {hasCredential && (
        <FadeUp delay={0.18} onMount>
          <div className="max-w-xl rounded-lg border border-border bg-surface p-4">
            <ProfilePasswordForm email={user.email} />
          </div>
        </FadeUp>
      )}
      <FadeUp delay={0.24} onMount>
        <div className="max-w-xl border-t border-border pt-6">
          <ProfileDeleteDialog name={user.name} />
        </div>
      </FadeUp>
    </div>
  )
}

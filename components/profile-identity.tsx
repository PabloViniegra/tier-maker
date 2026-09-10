import { Badge } from '@/components/ui/badge'
import { TierRowsBackground } from '@/components/tier-rows-background'
import { formatLongDate } from '@/lib/utils/format-date'

export function ProfileIdentity({
  name,
  email,
  createdAt,
  providers = [],
}: {
  name: string
  email: string
  createdAt: Date
  providers?: string[]
}) {
  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (email[0] ?? '').toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-4">
      <TierRowsBackground showLabels={false} />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-background text-lg font-semibold text-foreground ring-1 ring-border"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-[2rem] leading-tight text-balance text-foreground">
            {name || email}
          </h1>
          {name ? (
            <p className="truncate text-sm text-pretty text-muted-foreground">
              {email}
            </p>
          ) : null}
          {providers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {providers.includes('credential') && (
                <Badge variant="secondary" className="rounded-sm">
                  Email
                </Badge>
              )}
              {providers.includes('google') && (
                <Badge variant="secondary" className="rounded-sm">
                  Google
                </Badge>
              )}
            </div>
          )}
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            Member since {formatLongDate(createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

import { Badge } from '@/components/ui/badge'
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
    <div className="flex items-center gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        {name ? (
          <p className="font-heading text-lg text-foreground">{name}</p>
        ) : null}
        <p className="truncate text-sm text-muted-foreground">{email}</p>
        {providers.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {providers.includes('credential') && (
              <Badge variant="secondary">Email</Badge>
            )}
            {providers.includes('google') && (
              <Badge variant="secondary">Google</Badge>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Member since {formatLongDate(createdAt)}
        </p>
      </div>
    </div>
  )
}

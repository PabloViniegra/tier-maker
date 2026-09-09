'use client'

import { useHydrated } from '@/lib/hooks/use-hydrated'
import { formatLongDate, formatRelativeDate } from '@/lib/utils/format-date'

type Props = {
  date: Date | string | null
  className?: string
}

export function RelativeDate({ date, className }: Props) {
  const hydrated = useHydrated()
  const parsed = date ? (date instanceof Date ? date : new Date(date)) : null

  return (
    <time dateTime={parsed?.toISOString()} className={className}>
      {hydrated
        ? formatRelativeDate(date)
        : parsed
          ? formatLongDate(parsed)
          : 'Never'}
    </time>
  )
}

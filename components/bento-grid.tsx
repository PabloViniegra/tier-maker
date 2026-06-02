import { cn } from '@/lib/utils'

interface BentoCellProps {
  className?: string
  children: React.ReactNode
  colSpan?: 4 | 8 | 12
  rowSpan?: 1 | 2
}

const COL_SPAN: Record<NonNullable<BentoCellProps['colSpan']>, string> = {
  4: 'col-span-12 md:col-span-6 lg:col-span-4',
  8: 'col-span-12 lg:col-span-8',
  12: 'col-span-12',
}

const ROW_SPAN: Record<NonNullable<BentoCellProps['rowSpan']>, string> = {
  1: '',
  2: 'lg:row-span-2',
}

export function BentoCell({
  className,
  children,
  colSpan = 4,
  rowSpan = 1,
}: BentoCellProps) {
  return (
    <div
      className={cn(
        COL_SPAN[colSpan],
        ROW_SPAN[rowSpan],
        'group relative overflow-hidden rounded-xl border border-border bg-card',
        'transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:border-primary/25 hover:shadow-[inset_0_1px_0_oklch(0.62_0.22_250/0.08)]',
        'active:scale-[0.99] active:transition-transform active:duration-100',
        className
      )}
    >
      {children}
    </div>
  )
}

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('grid grid-cols-12 gap-3', className)}>{children}</div>
  )
}

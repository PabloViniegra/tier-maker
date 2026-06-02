import Link from 'next/link'
import { Layers, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
      <Layers size={32} strokeWidth={1} className="text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h4 className="font-heading text-base">No tier lists yet</h4>
        <p className="text-sm text-muted-foreground">
          Create your first tier list to start ranking things.
        </p>
      </div>
      <Link
        href="/dashboard/tier-lists/new"
        className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
      >
        <Plus size={14} strokeWidth={1.5} />
        Create Tier List
      </Link>
    </div>
  )
}

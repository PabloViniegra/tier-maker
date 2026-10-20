'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Flag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ActionTooltip } from '@/components/action-tooltip'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { reportTierList } from '@/app/explore/_actions/report-tier-list'
import {
  MAX_REPORT_DETAILS_LENGTH,
  REPORT_REASONS,
  type ReportReason,
} from '@/lib/validators/report'
import { cn } from '@/lib/utils'

const REASON_LABELS = {
  spam: 'Spam or misleading',
  sexual: 'Sexual content',
  violence: 'Violent or graphic content',
  hate: 'Hate or harassment',
  copyright: 'Copyright infringement',
  other: 'Something else',
} satisfies Record<ReportReason, string>

const triggerClassName = 'h-11 w-11 sm:h-9 sm:w-9'

type Props = {
  templateId: string
  isAuthenticated: boolean
}

export function ReportButton({ templateId, isAuthenticated }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  if (!isAuthenticated) {
    return (
      <ActionTooltip label="Report">
        <Link
          href="/login"
          aria-label="Report tier list"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-lg' }),
            triggerClassName
          )}
        >
          <Flag size={14} aria-hidden="true" />
        </Link>
      </ActionTooltip>
    )
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setReason(null)
      setDetails('')
      setError(undefined)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setError(undefined)
    startTransition(async () => {
      try {
        const { status } = await reportTierList({
          templateId,
          reason,
          details: details.trim() || undefined,
        })
        toast.success(
          status === 'reported'
            ? 'Thanks. We will review this tier list.'
            : 'You already reported this tier list.'
        )
        onOpenChange(false)
      } catch {
        setError(
          'Could not send the report. Check your connection and try again.'
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionTooltip label="Report">
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              className={triggerClassName}
              aria-label="Report tier list"
            />
          }
        >
          <Flag size={14} aria-hidden="true" />
        </DialogTrigger>
      </ActionTooltip>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Report tier list</DialogTitle>
            <DialogDescription>
              Tell us what is wrong. Reports are reviewed by a person.
            </DialogDescription>
          </DialogHeader>
          <fieldset className="flex flex-col gap-1">
            <legend className="sr-only">Reason</legend>
            {REPORT_REASONS.map((value) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm transition-colors hover:bg-accent/60 has-checked:bg-accent has-checked:text-accent-foreground sm:min-h-9"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  className="accent-primary"
                />
                {REASON_LABELS[value]}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="report-details">Details (optional)</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {details.length}/{MAX_REPORT_DETAILS_LENGTH}
              </span>
            </div>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={MAX_REPORT_DETAILS_LENGTH}
              rows={3}
              className="resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={!reason || isPending}
              aria-busy={isPending}
            >
              {isPending && (
                <Loader2
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {isPending ? 'Sending…' : 'Send report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

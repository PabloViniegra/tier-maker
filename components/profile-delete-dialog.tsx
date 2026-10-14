'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { profileDialogStepVariants } from '@/lib/motion-variants'

interface ProfileDeleteDialogProps {
  name: string
  created: number
  published: number
  likesReceived: number
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

export function ProfileDeleteDialog({
  name,
  created,
  published,
  likesReceived,
}: ProfileDeleteDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<'review' | 'confirm'>('review')
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const confirmationText = name.trim() || 'DELETE'
  const matches = typed.trim() === confirmationText
  const isConfirm = step === 'confirm'

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setTyped('')
      setStep('review')
      setDeleting(false)
      setDeleteError(undefined)
    }
  }

  const deleteAccount = async () => {
    if (!matches) return
    setDeleting(true)
    setDeleteError(undefined)
    try {
      const result = await authClient.deleteUser()
      if (result.error) {
        setDeleteError(result.error.message || 'Could not delete your account.')
        return
      }
      toast.success('Your account has been deleted.')
      router.replace('/')
    } catch {
      setDeleteError('Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 'review') {
      setStep('confirm')
      return
    }
    void deleteAccount()
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-sm text-muted-foreground">
        Delete account
      </h2>
      <p className="text-sm text-pretty text-muted-foreground">
        Permanently deletes your account, lists, and saved presets. This can&apos;t
        be undone.
      </p>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger
          render={<Button variant="destructive" className="h-11 sm:h-8" />}
        >
          Delete account
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={onSubmit} className="contents">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={step}
                variants={profileDialogStepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <div className="flex items-baseline justify-between gap-3">
                    <DialogTitle>
                      {isConfirm ? 'Confirm deletion' : 'Delete account'}
                    </DialogTitle>
                    <p
                      className="text-xs text-muted-foreground tabular-nums"
                      role="status"
                      aria-live="polite"
                    >
                      {isConfirm ? '2 / 2' : '1 / 2'}
                    </p>
                  </div>
                  <DialogDescription id="delete-account-hint">
                    {isConfirm ? (
                      <>
                        Type{' '}
                        <span className="font-mono text-foreground">
                          {confirmationText}
                        </span>{' '}
                        to permanently delete your account.
                      </>
                    ) : (
                      "This can't be undone. Everything below is permanently deleted."
                    )}
                  </DialogDescription>
                </DialogHeader>
                {!isConfirm && (
                  <>
                    <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-foreground marker:text-muted-foreground">
                      {created > 0 && (
                        <li>
                          {plural(created, 'list', 'lists')}
                          {published > 0 &&
                            `, including ${plural(published, 'public list', 'public lists')} that will disappear from Explore`}
                        </li>
                      )}
                      {likesReceived > 0 && (
                        <li>
                          {plural(likesReceived, 'like', 'likes')} your lists
                          received
                        </li>
                      )}
                      <li>Your saved presets and the likes you&apos;ve given</li>
                    </ul>
                    {created > 0 && (
                      <p className="text-sm text-pretty text-muted-foreground">
                        Want to keep a list as an image? Open it and use Export
                        first.{' '}
                        <Link
                          href="/dashboard/tier-lists"
                          className="text-foreground underline underline-offset-4 hover:text-primary"
                        >
                          Go to your lists
                        </Link>
                      </p>
                    )}
                  </>
                )}
                {isConfirm && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="delete-account-name">
                        {name.trim() ? 'Display name' : 'Confirmation'}
                      </Label>
                      <Input
                        id="delete-account-name"
                        value={typed}
                        onChange={(e) => {
                          setTyped(e.target.value)
                          if (deleteError) setDeleteError(undefined)
                        }}
                        autoComplete="off"
                        spellCheck={false}
                        aria-describedby={
                          deleteError
                            ? 'delete-account-hint delete-account-error'
                            : 'delete-account-hint'
                        }
                        className={
                          matches ? 'h-11 border-primary sm:h-8' : 'h-11 sm:h-8'
                        }
                      />
                    </div>
                    {deleteError && (
                      <p
                        id="delete-account-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {deleteError}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <DialogFooter>
              {isConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('review')}
                  disabled={deleting}
                  className="h-11 sm:h-8"
                >
                  Back
                </Button>
              ) : (
                <DialogClose
                  render={<Button variant="outline" className="h-11 sm:h-8" />}
                >
                  Cancel
                </DialogClose>
              )}
              {isConfirm ? (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!matches || deleting}
                  aria-busy={deleting}
                  className="h-11 sm:h-8"
                >
                  {deleting && (
                    <Loader2
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  {deleting ? 'Deleting account…' : 'Delete my account'}
                </Button>
              ) : (
                <Button type="submit" variant="outline" className="h-11 sm:h-8">
                  Continue
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

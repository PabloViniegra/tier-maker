'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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

export function ProfileDeleteDialog({ name }: { name: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'review' | 'confirm'>('review')
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const matches = typed.trim() === name.trim()
  const isConfirm = step === 'confirm'

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setTyped('')
      setStep('review')
      setDeleting(false)
    }
  }

  const deleteAccount = async () => {
    if (!matches) return
    setDeleting(true)
    try {
      const result = await authClient.deleteUser()
      if (result.error) {
        toast.error(
          result.error.message || 'Could not delete your account.'
        )
        return
      }
      router.replace('/')
    } catch {
      toast.error('Something went wrong. Please try again.')
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
      <p className="text-sm text-muted-foreground">
        This permanently deletes your account and lists. This cannot be undone.
      </p>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger render={<Button variant="destructive" />}>
          Delete account
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={onSubmit} className="contents">
            <DialogHeader>
              <div className="flex items-baseline justify-between gap-3">
                <DialogTitle>
                  {isConfirm ? 'Confirm deletion' : 'Delete account'}
                </DialogTitle>
                <p
                  className="text-xs text-muted-foreground tabular-nums"
                  aria-hidden="true"
                >
                  {isConfirm ? '2 / 2' : '1 / 2'}
                </p>
              </div>
              <DialogDescription id="delete-account-hint">
                {isConfirm
                  ? `Type ${name} to delete your account.`
                  : 'This cannot be undone. Your account and all of your lists will be removed.'}
              </DialogDescription>
            </DialogHeader>
            {isConfirm && (
              <>
                <p className="font-mono text-sm text-foreground">{name}</p>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-account-name">Display name</Label>
                  <Input
                    id="delete-account-name"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                    aria-describedby={
                      matches
                        ? 'delete-account-hint'
                        : 'delete-account-mismatch'
                    }
                    className={matches ? 'border-primary' : undefined}
                  />
                  {!matches && (
                    <p
                      id="delete-account-mismatch"
                      className="text-xs text-muted-foreground"
                    >
                      Type your display name exactly.
                    </p>
                  )}
                </div>
              </>
            )}
            <DialogFooter>
              {isConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('review')}
                  disabled={deleting}
                >
                  Back
                </Button>
              ) : (
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
              )}
              {isConfirm ? (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!matches || deleting}
                >
                  {deleting && (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  )}
                  Delete account
                </Button>
              ) : (
                <Button type="submit" variant="outline">
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

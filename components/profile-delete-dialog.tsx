'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
  const [typed, setTyped] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const matches = typed.trim() === name.trim()

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setTyped('')
      setConfirmOpen(false)
    }
  }

  const deleteAccount = async () => {
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

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-base">Delete account</h2>
      <p className="text-sm text-muted-foreground">
        This permanently deletes your account and lists. This cannot be undone.
      </p>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger render={<Button variant="destructive" />}>
          Delete account
        </DialogTrigger>
        <DialogContent className="data-nested-dialog-open:after:absolute data-nested-dialog-open:after:inset-0 data-nested-dialog-open:after:bg-black/5">
          <DialogHeader>
            <DialogTitle>Type your display name</DialogTitle>
            <DialogDescription>
              Enter {name} to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-account-name">Display name</Label>
            <Input
              id="delete-account-name"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={!matches}
              onClick={() => setConfirmOpen(true)}
            >
              Continue
            </Button>
          </DialogFooter>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent showOverlay={false}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone. All of your lists will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleting}
                  onClick={deleteAccount}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </div>
  )
}

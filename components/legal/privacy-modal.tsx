'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LegalSections } from './legal-sections'
import { privacySections } from '@/lib/legal/content'

export function PrivacyModal() {
  return (
    <Dialog>
      <DialogTrigger className="text-foreground/80 transition-colors hover:text-foreground">
        Privacy Policy
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>Last updated June 7, 2026.</DialogDescription>
        </DialogHeader>
        <LegalSections sections={privacySections} />
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SaveBar({
  onSave,
  isSaving,
}: {
  onSave: () => void
  isSaving: boolean
}) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onSave}
      disabled={isSaving}
      className="h-11 gap-2"
      data-testid="save-button"
    >
      <Save size={14} aria-hidden="true" />
      {isSaving ? 'Saving…' : 'Save tier list'}
    </Button>
  )
}

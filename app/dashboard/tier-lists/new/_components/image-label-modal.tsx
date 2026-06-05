'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAX_IMAGE_LABEL_LENGTH } from '@/lib/validators/tier-list'

export type LabeledFile = {
  file: File
  label: string
}

type Props = {
  files: File[]
  onConfirm: (labeled: LabeledFile[]) => void
  onCancel: () => void
}

export function ImageLabelModal({ files, onConfirm, onCancel }: Props) {
  const [labels, setLabels] = useState<string[]>(() => files.map(() => ''))

  const allFilled = labels.every((l) => l.trim().length > 0)

  function handleConfirm() {
    if (!allFilled) return
    onConfirm(files.map((file, i) => ({ file, label: labels[i].trim() })))
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Name your images</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {files.map((file, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Label htmlFor={`label-${i}`} className="text-xs text-muted-foreground truncate">
                {file.name}
              </Label>
              <Input
                id={`label-${i}`}
                value={labels[i]}
                onChange={(e) =>
                  setLabels((prev) => {
                    const next = [...prev]
                    next[i] = e.target.value
                    return next
                  })
                }
                placeholder={file.name}
                maxLength={MAX_IMAGE_LABEL_LENGTH}
                autoFocus={i === 0}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!allFilled}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

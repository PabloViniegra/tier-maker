'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

function labelFromFileName(name: string): string {
  const label = name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .slice(0, MAX_IMAGE_LABEL_LENGTH)
    .trim()
  return label || 'Image'
}

function FilePreview({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (ref.current) ref.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ref} alt="" className="size-full object-cover" />
    </div>
  )
}

export function ImageLabelModal({ files, onConfirm, onCancel }: Props) {
  const [labels, setLabels] = useState<string[]>(() =>
    files.map((file) => labelFromFileName(file.name))
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onConfirm(
      files.map((file, i) => ({
        file,
        label: labels[i].trim() || labelFromFileName(file.name),
      }))
    )
  }

  const count = files.length

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className="flex max-h-[min(40rem,calc(100dvh-2rem))] flex-col overflow-hidden sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
          <DialogHeader className="pr-8">
            <DialogTitle>Name your images</DialogTitle>
            <DialogDescription>
              Labels show under each image. We used the file names; change any
              you like.
            </DialogDescription>
          </DialogHeader>

          <ul className="-mx-4 flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-1">
            {files.map((file, i) => (
              <li key={i} className="flex items-center gap-3">
                <FilePreview file={file} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    htmlFor={`label-${i}`}
                    className="block truncate text-xs font-normal text-muted-foreground"
                  >
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
                    name={`image-label-${i}`}
                    aria-label={`Label for ${file.name}`}
                    autoComplete="off"
                    placeholder={labelFromFileName(file.name)}
                    maxLength={MAX_IMAGE_LABEL_LENGTH}
                  />
                </div>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {count === 1 ? 'Add image' : `Add ${count} images`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

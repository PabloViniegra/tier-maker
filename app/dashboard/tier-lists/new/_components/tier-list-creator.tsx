'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { ArrowLeft, Plus } from 'lucide-react'
import { useTierEditor, buildSavePayload, hasPendingUploads } from '@/lib/stores/tier-editor'
import { MetadataPanel } from './metadata-panel'
import { ItemBank } from './item-bank'
import { TierBoard } from './tier-board'
import { SaveBar } from './save-bar'
import { ImageLabelModal, type LabeledFile } from './image-label-modal'
import { uploadImagesAction, createTierListAction } from '../actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BANK_DROPPABLE, rowIdFromDroppableId } from './constants'
import type { UserCategoryPreset } from '@/lib/queries/user-category-presets'

export function TierListCreator({
  categoryPresets,
  userCategoryPresets,
}: {
  categoryPresets: string[]
  userCategoryPresets: UserCategoryPreset[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null)

  function openModal(files: File[]) {
    const { bankItems } = useTierEditor.getState()
    const filtered: File[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5 MB`)
        continue
      }
      filtered.push(file)
    }
    if (bankItems.length + filtered.length > 30) {
      toast.error('You can upload at most 30 images per tier list')
      return
    }
    if (filtered.length > 0) setPendingFiles(filtered)
  }

  const handleModalConfirm = useCallback(async (labeled: LabeledFile[]) => {
    setPendingFiles(null)
    const { addUploadingItem, markItemUploaded, markItemError } = useTierEditor.getState()
    for (const { file, label } of labeled) {
      const id = addUploadingItem(label)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const { url } = await uploadImagesAction(fd)
        markItemUploaded(id, url)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        markItemError(id)
        toast.error(message)
      }
    }
  }, [])

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.items ?? [])
      const files: File[] = []
      for (const item of items) {
        if (item.kind === 'file') {
          const f = item.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length === 0) return
      e.preventDefault()
      openModal(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault()
        setIsDraggingFile(true)
      }
    }
    function onDragLeave(e: DragEvent) {
      if ((e.target as HTMLElement)?.id === 'page-dropzone-overlay') {
        setIsDraggingFile(false)
      }
    }
    function onDrop(e: DragEvent) {
      if (!e.dataTransfer?.files?.length) return
      e.preventDefault()
      setIsDraggingFile(false)
      openModal(Array.from(e.dataTransfer.files))
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }
    const fromBank = source.droppableId === BANK_DROPPABLE
    const toBank = destination.droppableId === BANK_DROPPABLE
    useTierEditor.getState().moveItem({
      source: fromBank ? 'bank' : 'row',
      sourceId: fromBank ? undefined : rowIdFromDroppableId(source.droppableId),
      sourceIndex: source.index,
      target: toBank ? 'bank' : 'row',
      targetId: toBank ? undefined : rowIdFromDroppableId(destination.droppableId),
      targetIndex: destination.index,
    })
  }, [])

  const handleSave = useCallback(() => {
    const current = useTierEditor.getState()
    if (current.metadata.title.trim() === '') {
      toast.error('Title is required')
      return
    }
    if (current.metadata.category.trim() === '') {
      toast.error('Category is required')
      return
    }
    if (hasPendingUploads(current)) {
      toast.error('Wait for uploads to finish')
      return
    }
    if (current.bankItems.length === 0 && current.rows.every((r) => r.items.length === 0)) {
      toast.error('Upload at least one image')
      return
    }
    startTransition(async () => {
      try {
        await createTierListAction(buildSavePayload(current))
        useTierEditor.getState().reset()
        toast.success('Tier list created')
        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not save tier list'
        toast.error(message)
      }
    })
  }, [router])

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Link
            href='/dashboard'
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'gap-1.5 text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <h1 className='font-heading text-xl'>New tier list</h1>
        </div>
        <SaveBar onSave={handleSave} isSaving={isPending} />
      </header>

      <MetadataPanel categoryPresets={categoryPresets} userPresets={userCategoryPresets} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
          <TierBoard />
          <ItemBank onPickFiles={openModal} />
        </div>
      </DragDropContext>

      {isDraggingFile && <PageDropOverlay />}

      {pendingFiles && (
        <ImageLabelModal
          files={pendingFiles}
          onConfirm={handleModalConfirm}
          onCancel={() => setPendingFiles(null)}
        />
      )}
    </div>
  )
}

function PageDropOverlay() {
  return (
    <div
      id='page-dropzone-overlay'
      className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm'
    >
      <div className='flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary bg-surface px-10 py-8 shadow-overlay'>
        <Plus size={28} strokeWidth={1.5} className='text-primary' />
        <p className='font-heading text-base'>Drop images to upload</p>
        <p className='text-xs text-muted-foreground'>JPG, PNG, WEBP, GIF · up to 5 MB each</p>
      </div>
    </div>
  )
}

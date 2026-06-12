'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DragDropContext } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import {
  useTierEditor,
  buildSavePayload,
  hasPendingUploads,
  type TierListDetailSeed,
} from '@/lib/stores/tier-editor'
import { useTierDnd } from '@/lib/hooks/use-tier-dnd'
import { MetadataPanel } from './metadata-panel'
import { ItemBank } from './item-bank'
import { TierBoard } from './tier-board'
import { SaveBar } from './save-bar'
import { ImageLabelModal, type LabeledFile } from './image-label-modal'
import { uploadImagesAction, createTierListAction } from '../actions'
import { updateTierListStructureAction } from '../../[id]/edit/actions'
import { PageHeader } from '@/components/page-header'
import type { UserCategoryPreset } from '@/lib/queries/user-category-presets'

type TierListCreatorProps = {
  categoryPresets: string[]
  userCategoryPresets: UserCategoryPreset[]
} & (
  | { initialData: TierListDetailSeed; editId: string }
  | { initialData?: never; editId?: never }
)

export function TierListCreator({
  categoryPresets,
  userCategoryPresets,
  initialData,
  editId,
}: TierListCreatorProps) {
  const isEditMode = editId !== undefined
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { onDragEnd } = useTierDnd()
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null)

  useEffect(() => {
    if (initialData) {
      useTierEditor.getState().initFromDb(initialData)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = useCallback(
    (files: File[]) => {
      const { bankItems, rows } = useTierEditor.getState()
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
      const totalItems =
        bankItems.length + rows.reduce((n, r) => n + r.items.length, 0)
      if (totalItems + filtered.length > 30) {
        toast.error('You can upload at most 30 images per tier list')
        return
      }
      if (filtered.length > 0) setPendingFiles(filtered)
    },
    [setPendingFiles]
  )

  const openModalRef = useRef(openModal)
  useEffect(() => {
    openModalRef.current = openModal
  }, [openModal])

  const handleModalConfirm = useCallback(async (labeled: LabeledFile[]) => {
    setPendingFiles(null)
    const { addUploadingItem, markItemUploaded, markItemError } =
      useTierEditor.getState()
    await Promise.all(
      labeled.map(async ({ file, label }) => {
        const id = addUploadingItem(label)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const { url } = await uploadImagesAction(fd)
          markItemUploaded(id, url)
        } catch (err) {
          markItemError(id)
          toast.error(err instanceof Error ? err.message : 'Upload failed')
        }
      })
    )
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
      openModalRef.current(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

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
      openModalRef.current(Array.from(e.dataTransfer.files))
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
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
    if (
      !isEditMode &&
      current.bankItems.length === 0 &&
      current.rows.every((r) => r.items.length === 0)
    ) {
      toast.error('Upload at least one image')
      return
    }
    startTransition(async () => {
      try {
        const payload = buildSavePayload(current)
        if (isEditMode && editId) {
          await updateTierListStructureAction(editId, payload)
          useTierEditor.getState().reset()
          toast.success('Tier list updated')
          router.push('/dashboard/tier-lists')
        } else {
          await createTierListAction(payload)
          useTierEditor.getState().reset()
          toast.success('Tier list created')
          router.push('/dashboard')
        }
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not save tier list'
        toast.error(message)
      }
    })
  }, [router, isEditMode, editId])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        backHref={isEditMode ? '/dashboard/tier-lists' : '/dashboard'}
        title={isEditMode ? 'Edit tier list' : 'New tier list'}
      >
        <SaveBar onSave={handleSave} isSaving={isPending} />
      </PageHeader>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_1fr_320px] lg:items-start">
          <MetadataPanel
            categoryPresets={categoryPresets}
            userPresets={userCategoryPresets}
          />
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
      id="page-dropzone-overlay"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary bg-surface px-10 py-8 shadow-overlay">
        <Plus size={28} strokeWidth={1.5} className="text-primary" />
        <p className="font-heading text-base">Drop images to upload</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WEBP, GIF · up to 5 MB each
        </p>
      </div>
    </div>
  )
}

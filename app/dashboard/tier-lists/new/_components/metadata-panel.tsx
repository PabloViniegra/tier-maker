'use client'

import { useRef, useState, useTransition } from 'react'
import { Check, ChevronsUpDown, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { cn } from '@/lib/utils'
import {
  saveUserCategoryPresetAction,
  deleteUserCategoryPresetAction,
  uploadImagesAction,
} from '../actions'
import type { UserCategoryPreset } from '@/lib/queries/user-category-presets'

export function MetadataPanel({
  categoryPresets,
  userPresets: initialUserPresets,
}: {
  categoryPresets: string[]
  userPresets: UserCategoryPreset[]
}) {
  const metadata = useTierEditor((s) => s.metadata)
  const setMetadata = useTierEditor((s) => s.setMetadata)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryInput, setCategoryInput] = useState(metadata.category)
  const [userPresets, setUserPresets] = useState(initialUserPresets)
  const [isPending, startTransition] = useTransition()
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const filteredDefaults = categoryPresets.filter((p) =>
    p.toLowerCase().includes(categoryInput.toLowerCase().trim())
  )
  const filteredUser = userPresets.filter((p) =>
    p.name.toLowerCase().includes(categoryInput.toLowerCase().trim())
  )
  const inputTrimmed = categoryInput.trim()
  const isAlreadyPreset =
    categoryPresets.some((p) => p.toLowerCase() === inputTrimmed.toLowerCase()) ||
    userPresets.some((p) => p.name.toLowerCase() === inputTrimmed.toLowerCase())

  function selectCategory(value: string) {
    setMetadata({ category: value })
    setCategoryInput(value)
    setCategoryOpen(false)
  }

  function handleSaveAndUse() {
    if (!inputTrimmed) return
    startTransition(async () => {
      try {
        const saved = await saveUserCategoryPresetAction(inputTrimmed)
        if (saved) {
          setUserPresets((prev) => [saved, ...prev])
          toast.success(`"${inputTrimmed}" guardado como preset`)
        }
        selectCategory(inputTrimmed)
      } catch {
        toast.error('No se pudo guardar el preset')
      }
    })
  }

  function handleDeletePreset(preset: UserCategoryPreset) {
    setUserPresets((prev) => prev.filter((p) => p.id !== preset.id))
    startTransition(async () => {
      try {
        await deleteUserCategoryPresetAction(preset.id)
      } catch {
        setUserPresets((prev) => [preset, ...prev])
        toast.error('No se pudo eliminar el preset')
      }
    })
  }

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!file.type.startsWith('image/')) {
      toast.error('Cover must be an image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be 5 MB or smaller')
      return
    }
    setIsUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await uploadImagesAction(fd)
      setMetadata({ coverImageUrl: url })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploadingCover(false)
    }
  }

  return (
    <section
      aria-labelledby='metadata-heading'
      className='flex flex-col gap-4 rounded-lg border border-border bg-surface p-5'
    >
      <header className='flex items-baseline justify-between gap-3'>
        <h2 id='metadata-heading' className='font-heading text-sm'>
          Details
        </h2>
      </header>

      <div className='flex flex-col gap-2'>
        <div className='flex items-baseline justify-between'>
          <Label htmlFor='title' className='text-xs font-medium text-muted-foreground'>
            Title
          </Label>
          <span className='text-[11px] text-muted-foreground tabular-nums'>
            {metadata.title.length}/80
          </span>
        </div>
        <Input
          id='title'
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
          placeholder='Best movies of all time'
          maxLength={80}
          required
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px] md:items-start'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='category' className='text-xs font-medium text-muted-foreground'>
            Category
          </Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger
              render={
                <Button
                  id='category'
                  type='button'
                  variant='outline'
                  role='combobox'
                  aria-expanded={categoryOpen}
                  className='w-full justify-between font-normal'
                />
              }
            >
              <span className={cn('truncate', !metadata.category && 'text-muted-foreground')}>
                {metadata.category || 'Pick a category'}
              </span>
              <ChevronsUpDown size={14} className='opacity-50' />
            </PopoverTrigger>
            <PopoverContent
              className='w-[var(--anchor-width)] p-0'
              align='start'
            >
              <Command
                filter={(value, search) => {
                  if (value.toLowerCase().includes(search.toLowerCase())) return 1
                  return 0
                }}
              >
                <CommandInput
                  value={categoryInput}
                  onValueChange={setCategoryInput}
                  placeholder='Buscar o escribir una categoría...'
                />
                <CommandList>
                  <CommandEmpty>
                    <div className='flex flex-col gap-1 p-1'>
                      <button
                        type='button'
                        onClick={() => selectCategory(inputTrimmed)}
                        className='rounded px-2 py-1.5 text-sm text-primary hover:bg-accent hover:text-accent-foreground text-left'
                      >
                        Usar &quot;{inputTrimmed}&quot;
                      </button>
                      {inputTrimmed && !isAlreadyPreset && (
                        <button
                          type='button'
                          disabled={isPending}
                          onClick={handleSaveAndUse}
                          className='rounded px-2 py-1.5 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground text-left disabled:opacity-50'
                        >
                          Guardar y usar &quot;{inputTrimmed}&quot;
                        </button>
                      )}
                    </div>
                  </CommandEmpty>

                  {filteredDefaults.length > 0 && (
                    <CommandGroup heading='Presets'>
                      {filteredDefaults.map((preset) => (
                        <CommandItem
                          key={preset}
                          value={preset}
                          onSelect={selectCategory}
                        >
                          {preset}
                          <Check
                            className={cn(
                              'ml-auto opacity-0',
                              metadata.category === preset && 'opacity-100'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {filteredUser.length > 0 && (
                    <>
                      {filteredDefaults.length > 0 && <CommandSeparator />}
                      <CommandGroup heading='Mis categorías'>
                        {filteredUser.map((preset) => (
                          <CommandItem
                            key={preset.id}
                            value={preset.name}
                            onSelect={selectCategory}
                            className='group'
                          >
                            <span className='flex-1'>{preset.name}</span>
                            <Check
                              className={cn(
                                'opacity-0 shrink-0',
                                metadata.category === preset.name && 'opacity-100'
                              )}
                            />
                            <button
                              type='button'
                              aria-label={`Eliminar preset ${preset.name}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePreset(preset)
                              }}
                              className='ml-1 shrink-0 rounded opacity-0 group-hover:opacity-100 hover:text-destructive'
                            >
                              <X size={12} />
                            </button>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='cover-image-input' className='text-xs font-medium text-muted-foreground'>
            Cover
          </Label>
          <input
            ref={coverInputRef}
            id='cover-image-input'
            type='file'
            accept='image/jpeg,image/png,image/webp,image/gif'
            className='sr-only'
            onChange={handleCoverFileChange}
            data-testid='cover-file-input'
          />
          {metadata.coverImageUrl ? (
            <div className='group/cover relative aspect-video w-full overflow-hidden rounded-md border border-border'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={metadata.coverImageUrl}
                alt='Cover image preview'
                className='h-full w-full object-cover'
              />
              <button
                type='button'
                onClick={() => setMetadata({ coverImageUrl: undefined })}
                className='absolute right-1 top-1 rounded bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/cover:opacity-100 focus-visible:opacity-100 hover:text-foreground'
                aria-label='Remove cover'
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 w-full justify-start gap-2 px-2.5'
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                <ImagePlus size={14} />
              )}
              {isUploadingCover ? 'Uploading…' : 'Upload cover'}
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex items-baseline justify-between'>
          <Label htmlFor='description' className='text-xs font-medium text-muted-foreground'>
            Description
          </Label>
          <span className='text-[11px] text-muted-foreground tabular-nums'>
            {metadata.description.length}/500
          </span>
        </div>
        <Textarea
          id='description'
          value={metadata.description}
          onChange={(e) => setMetadata({ description: e.target.value })}
          placeholder='A short description of your tier list'
          maxLength={500}
          className='min-h-8 resize-none'
          rows={1}
        />
      </div>
    </section>
  )
}

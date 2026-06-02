'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { cn } from '@/lib/utils'

export function MetadataPanel({
  categoryPresets,
}: {
  categoryPresets: string[]
}) {
  const { metadata, setMetadata } = useTierEditor()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryInput, setCategoryInput] = useState(metadata.category)

  return (
    <section className='grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-3'>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
          placeholder='Best movies of all time'
          maxLength={80}
          required
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='category'>Category</Label>
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
                placeholder='Search or type a custom one...'
              />
              <CommandList>
                <CommandEmpty>
                  <button
                    type='button'
                    onClick={() => {
                      setMetadata({ category: categoryInput.trim() })
                      setCategoryOpen(false)
                    }}
                    className='text-primary hover:underline'
                  >
                    Use &quot;{categoryInput.trim()}&quot;
                  </button>
                </CommandEmpty>
                <CommandGroup heading='Presets'>
                  {categoryPresets
                    .filter((p) =>
                      p.toLowerCase().includes(categoryInput.toLowerCase().trim())
                    )
                    .map((preset) => (
                      <CommandItem
                        key={preset}
                        value={preset}
                        onSelect={(value) => {
                          setMetadata({ category: value })
                          setCategoryInput(value)
                          setCategoryOpen(false)
                        }}
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
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex flex-col gap-1.5 md:col-span-1'>
        <Label htmlFor='description'>Description (optional)</Label>
        <Textarea
          id='description'
          value={metadata.description}
          onChange={(e) => setMetadata({ description: e.target.value })}
          placeholder='A short description of your tier list'
          maxLength={500}
          className='min-h-9 resize-none'
          rows={1}
        />
      </div>
    </section>
  )
}

'use client'

import { useRef, useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { X, Loader2, Plus } from 'lucide-react'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { droppableIdForRow } from './constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type TierRowChipProps = {
  label: string
  color: string
  canRemove: boolean
  onLabelChange: (label: string) => void
  onColorChange: (color: string) => void
  onRemove: () => void
}

function TierRowChip({ label, color, canRemove, onLabelChange, onColorChange, onRemove }: TierRowChipProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(label)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function confirmEdit() {
    const trimmed = draft.trim()
    if (trimmed) onLabelChange(trimmed)
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(label)
    setEditing(false)
  }

  return (
    <div
      className='group/chip relative flex h-16 w-20 shrink-0 items-center justify-center rounded font-heading text-sm font-bold text-white'
      style={{ background: color }}
      aria-label={`Tier ${label}`}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirmEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          className='w-[4.5rem] rounded bg-transparent text-center text-xs font-bold text-white outline-none placeholder:text-white/60'
          maxLength={20}
          aria-label='Edit tier label'
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className='line-clamp-2 cursor-text select-none break-words px-1 text-center text-xs leading-tight'
          title='Double-click to rename'
        >
          {label}
        </span>
      )}

      {/* color picker trigger */}
      <button
        type='button'
        onClick={() => colorRef.current?.click()}
        className='absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-sm border border-white/30 opacity-0 transition-opacity group-hover/chip:opacity-100'
        style={{ background: color }}
        aria-label='Change tier color'
      />
      <input
        ref={colorRef}
        type='color'
        defaultValue={color}
        onChange={(e) => onColorChange(e.target.value)}
        className='absolute h-0 w-0 opacity-0'
        tabIndex={-1}
        aria-hidden
      />

      {/* remove row */}
      <button
        type='button'
        onClick={onRemove}
        disabled={!canRemove}
        className={cn(
          'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100',
          !canRemove && 'cursor-not-allowed opacity-0'
        )}
        aria-label='Remove row'
      >
        <X size={9} />
      </button>
    </div>
  )
}

export function TierBoard() {
  const rows = useTierEditor((s) => s.rows)
  const removeItem = useTierEditor((s) => s.removeItem)
  const addRow = useTierEditor((s) => s.addRow)
  const updateRow = useTierEditor((s) => s.updateRow)
  const removeRow = useTierEditor((s) => s.removeRow)

  return (
    <section className='flex flex-col gap-1.5'>
      {rows.map((row) => (
        <div
          key={row.id}
          className='flex items-stretch gap-1.5'
          data-testid='tier-row'
        >
          <TierRowChip
            label={row.label}
            color={row.color}
            canRemove={rows.length > 1}
            onLabelChange={(label) => updateRow(row.id, { label })}
            onColorChange={(color) => updateRow(row.id, { color })}
            onRemove={() => removeRow(row.id)}
          />
          <Droppable droppableId={droppableIdForRow(row.id)} direction='horizontal'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex min-h-16 flex-1 flex-wrap items-center gap-1.5 rounded border border-border bg-surface px-2 py-1.5 transition-colors',
                  snapshot.isDraggingOver && 'border-primary/40 bg-primary/5'
                )}
                data-testid='tier-row-droppable'
              >
                {row.items.length === 0 && !snapshot.isDraggingOver && (
                  <span className='text-xs text-muted-foreground'>
                    Drag items here
                  </span>
                )}
                {row.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={cn(
                          'group relative h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-background',
                          dragSnapshot.isDragging && 'shadow-overlay'
                        )}
                        data-testid='row-item'
                      >
                        {item.status === 'uploaded' && item.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.name ?? ''}
                            className='h-full w-full object-cover'
                            draggable={false}
                          />
                        ) : item.status === 'uploading' ? (
                          <div className='flex h-full w-full items-center justify-center text-muted-foreground'>
                            <Loader2 size={12} className='animate-spin' />
                          </div>
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-destructive/20 text-destructive'>
                            <X size={12} />
                          </div>
                        )}
                        <button
                          type='button'
                          onClick={() =>
                            removeItem({ source: 'row', id: item.id, rowId: row.id })
                          }
                          className='absolute right-0 top-0 hidden rounded bg-background/80 p-0.5 text-muted-foreground group-hover:block hover:text-foreground'
                          aria-label='Remove'
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}

      {rows.length < 10 && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={addRow}
          className='mt-1 w-fit gap-1.5 text-muted-foreground hover:text-foreground'
        >
          <Plus size={14} />
          Add row
        </Button>
      )}
    </section>
  )
}

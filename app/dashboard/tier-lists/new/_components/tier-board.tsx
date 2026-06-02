'use client'

import { Droppable, Draggable } from '@hello-pangea/dnd'
import { X, Loader2 } from 'lucide-react'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { droppableIdForRow } from './constants'
import { cn } from '@/lib/utils'

export function TierBoard() {
  const rows = useTierEditor((s) => s.rows)
  const removeItem = useTierEditor((s) => s.removeItem)

  return (
    <section className='flex flex-col gap-1.5'>
      {rows.map((row) => (
        <div
          key={row.id}
          className='flex items-stretch gap-1.5'
          data-testid='tier-row'
        >
          <div
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded font-heading text-sm font-bold text-white'
            style={{ background: row.color }}
            aria-label={`Tier ${row.label}`}
          >
            {row.label}
          </div>
          <Droppable droppableId={droppableIdForRow(row.id)} direction='horizontal'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex min-h-12 flex-1 flex-wrap items-center gap-1.5 rounded border border-border bg-surface px-2 py-1.5 transition-colors',
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
                          'group relative h-9 w-9 shrink-0 overflow-hidden rounded border border-border bg-background',
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
    </section>
  )
}

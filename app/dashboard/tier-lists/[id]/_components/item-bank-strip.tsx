'use client'

import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'motion/react'
import { X, Loader2 } from 'lucide-react'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { BANK_DROPPABLE } from '@/app/dashboard/tier-lists/new/_components/constants'
import { dragActiveVariants } from '@/lib/motion-variants'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ItemBankStrip() {
  const bankItems = useTierEditor((s) => s.bankItems)
  const removeItem = useTierEditor((s) => s.removeItem)

  return (
    <div
      suppressHydrationWarning
      className="border-t-2 border-border bg-surface shadow-[0_-4px_16px_oklch(0_0_0/0.07)]"
    >
      <div className="px-4 pt-2 pb-1">
        <p className="text-xs font-medium text-muted-foreground">
          Items ({bankItems.length})
        </p>
      </div>
      <Droppable droppableId={BANK_DROPPABLE} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex min-h-24 items-center gap-2 overflow-x-auto px-4 pt-1 pb-3 transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5'
            )}
          >
            {bankItems.length === 0 && !snapshot.isDraggingOver && (
              <span className="shrink-0 text-xs text-muted-foreground">
                All items placed
              </span>
            )}
            <TooltipProvider>
              {bankItems.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  disableInteractiveElementBlocking
                >
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className="group/item relative h-20 w-20 shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
                    >
                      <motion.div
                        initial={false}
                        variants={dragActiveVariants}
                        animate={dragSnapshot.isDragging ? 'dragging' : 'idle'}
                        className="relative h-full w-full overflow-hidden rounded border border-border bg-background"
                      >
                        {item.status === 'uploaded' && item.url ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={<span />}
                              aria-label={item.label}
                              className="block h-full w-full"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.url}
                                alt={item.label}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                                draggable={false}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{item.label}</TooltipContent>
                          </Tooltip>
                        ) : item.status === 'uploading' ? (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Loader2 size={14} className="animate-spin" />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-destructive/20 text-destructive">
                            <X size={14} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            removeItem({ source: 'bank', id: item.id })
                          }
                          className="absolute top-0 right-0 rounded bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 hover:text-foreground focus-visible:opacity-100"
                          aria-label={`Remove ${item.label}`}
                        >
                          <X size={10} />
                        </button>
                      </motion.div>
                    </div>
                  )}
                </Draggable>
              ))}
            </TooltipProvider>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

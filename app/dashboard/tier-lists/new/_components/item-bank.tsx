'use client'

import { useRef } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'motion/react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { BANK_DROPPABLE } from './constants'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_ITEM_COUNT,
} from '@/lib/validators/tier-list'
import { deleteImagesAction } from '../../_actions/delete-images'
import { cn } from '@/lib/utils'
import { dragActiveVariants } from '@/lib/motion-variants'

export function ItemBank({
  onPickFiles,
}: {
  onPickFiles: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bankItems = useTierEditor((s) => s.bankItems)
  const removeItemEverywhere = useTierEditor((s) => s.removeItemEverywhere)

  return (
    <aside className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm">Item bank</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {bankItems.length}/{MAX_ITEM_COUNT}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = e.target.files
          if (!files || files.length === 0) return
          onPickFiles(Array.from(files))
          e.target.value = ''
        }}
        data-testid="bank-file-input"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => inputRef.current?.click()}
        data-testid="bank-upload-button"
      >
        <ImagePlus size={14} />
        Upload images
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Drag files into the page, paste (Ctrl+V), or click. JPG, PNG, WEBP, GIF
        up to 5 MB each.
      </p>

      <Droppable droppableId={BANK_DROPPABLE} direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-32 flex-1 rounded-lg border border-dashed p-2 transition-colors',
              snapshot.isDraggingOver
                ? 'border-primary/40 bg-primary/5'
                : 'border-border'
            )}
          >
            {bankItems.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <ImagePlus size={20} strokeWidth={1.25} />
                <p>Drop or upload images to start</p>
              </div>
            ) : (
              <TooltipProvider>
                <ul className="grid grid-cols-2 gap-2">
                  {bankItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      disableInteractiveElementBlocking
                    >
                      {(dragProvided, dragSnapshot) => (
                        <li
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className="group/item relative aspect-square"
                          data-testid="bank-item"
                        >
                          <motion.div
                            variants={dragActiveVariants}
                            animate={
                              dragSnapshot.isDragging ? 'dragging' : 'idle'
                            }
                            className="relative h-full w-full overflow-hidden rounded-md border border-border bg-background"
                          >
                            {item.status === 'uploaded' && item.url ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={<span />}
                                  className="block h-full w-full"
                                  aria-label={item.label}
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
                                <Loader2 size={16} className="animate-spin" />
                              </div>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-destructive/10 p-1 text-center text-[10px] text-destructive">
                                <span>Failed</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.status === 'uploaded' && item.url) {
                                  deleteImagesAction([item.url]).catch(() => {})
                                }
                                removeItemEverywhere(item.id)
                              }}
                              className="absolute top-1 right-1 rounded bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 hover:text-foreground focus-visible:opacity-100"
                              aria-label={`Remove ${item.label}`}
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                </ul>
              </TooltipProvider>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </aside>
  )
}

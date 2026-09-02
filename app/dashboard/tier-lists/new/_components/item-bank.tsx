'use client'

import { useRef } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'motion/react'
import { ImagePlus, ListPlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { BANK_DROPPABLE } from './constants'
import { ALLOWED_IMAGE_TYPES, MAX_ITEM_COUNT } from '@/lib/validators/tier-list'
import { deleteImagesAction } from '../../_actions/delete-images'
import { cn } from '@/lib/utils'
import { dragActiveVariants } from '@/lib/motion-variants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function pasteShortcutLabel() {
  const platform =
    globalThis.navigator?.platform || globalThis.navigator?.userAgent || ''
  return /Mac|iPhone|iPad|iPod/.test(platform) ? '⌘V' : 'Ctrl+V'
}

export function ItemBank({
  onPickFiles,
}: {
  onPickFiles: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadButtonRef = useRef<HTMLButtonElement>(null)
  const bankItems = useTierEditor((s) => s.bankItems)
  const rows = useTierEditor((s) => s.rows)
  const moveItem = useTierEditor((s) => s.moveItem)
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
        aria-label="Upload images"
        data-testid="bank-file-input"
      />

      <Button
        type="button"
        ref={uploadButtonRef}
        variant="outline"
        size="sm"
        className="h-11 w-full justify-between gap-2"
        onClick={() => inputRef.current?.click()}
        data-testid="bank-upload-button"
      >
        <span className="flex items-center gap-2">
          <ImagePlus size={14} aria-hidden="true" />
          Upload images
        </span>
        <kbd
          aria-hidden="true"
          suppressHydrationWarning
          className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
        >
          {pasteShortcutLabel()}
        </kbd>
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        JPG, PNG, WEBP, GIF up to 5 MB each.
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
                <ImagePlus size={20} strokeWidth={1.25} aria-hidden="true" />
                <p>Paste, drop, or upload to start</p>
              </div>
            ) : (
              <TooltipProvider>
                <ul className="grid grid-cols-2 gap-2">
                  {bankItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <li
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="group/item relative aspect-square"
                          data-testid="bank-item"
                        >
                          <motion.div
                            initial="rest"
                            variants={dragActiveVariants}
                            animate={
                              dragSnapshot.isDragging ? 'dragging' : 'idle'
                            }
                            whileHover="hover"
                            className="relative h-full w-full overflow-hidden rounded-md border border-border bg-background"
                          >
                            {item.status === 'uploaded' && item.url ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={<span />}
                                  {...dragProvided.dragHandleProps}
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
                                    loading="lazy"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>{item.label}</TooltipContent>
                              </Tooltip>
                            ) : item.status === 'uploading' ? (
                              <div
                                {...dragProvided.dragHandleProps}
                                className="flex h-full w-full items-center justify-center text-muted-foreground"
                              >
                                <Loader2 size={16} className="animate-spin" />
                              </div>
                            ) : (
                              <div
                                {...dragProvided.dragHandleProps}
                                className="flex h-full w-full flex-col items-center justify-center gap-1 bg-destructive/10 p-1 text-center text-xs text-destructive"
                              >
                                <span>Failed</span>
                              </div>
                            )}
                            {item.status === 'uploaded' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  className="absolute bottom-0 left-0 flex size-11 items-center justify-center"
                                  aria-label={`Move ${item.label} to a tier`}
                                >
                                  <span className="flex size-7 items-center justify-center rounded-md border border-border bg-background/90 text-foreground shadow-overlay">
                                    <ListPlus size={14} aria-hidden="true" />
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  side="top"
                                  align="start"
                                  className="min-w-36"
                                >
                                  {rows.map((row, rowIndex) => (
                                    <DropdownMenuItem
                                      key={row.id}
                                      className="h-11"
                                      aria-label={`${row.label} tier, row ${rowIndex + 1}`}
                                      onClick={() => {
                                        moveItem({
                                          source: 'bank',
                                          sourceIndex: index,
                                          target: 'row',
                                          targetId: row.id,
                                          targetIndex: row.items.length,
                                        })
                                        setTimeout(
                                          () =>
                                            uploadButtonRef.current?.focus(),
                                          0
                                        )
                                      }}
                                    >
                                      <span
                                        className="size-3 rounded-sm"
                                        style={{ backgroundColor: row.color }}
                                        aria-hidden="true"
                                      />
                                      {row.label} tier
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        Row {rowIndex + 1}
                                      </span>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.status === 'uploaded' && item.url) {
                                  deleteImagesAction([item.url]).catch(() => {})
                                }
                                removeItemEverywhere(item.id)
                              }}
                              className="absolute top-0 right-0 flex size-11 items-center justify-center text-muted-foreground"
                              aria-label={`Remove ${item.label}`}
                            >
                              <span className="flex size-7 items-center justify-center rounded-md border border-border bg-background/90 shadow-overlay hover:text-foreground">
                                <X size={12} aria-hidden="true" />
                              </span>
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

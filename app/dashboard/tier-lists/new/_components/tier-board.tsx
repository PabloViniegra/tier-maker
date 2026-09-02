'use client'

import { useRef, useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'motion/react'
import { X, Loader2, Plus, Palette } from 'lucide-react'
import { useTierEditor } from '@/lib/stores/tier-editor'
import { droppableIdForRow } from './constants'
import { cn } from '@/lib/utils'
import {
  dragActiveVariants,
  fadeUpVariants,
  hoverRevealVariants,
  staggerIndex,
  STAGGER_DELAY,
} from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/color-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type TierRowChipProps = {
  label: string
  color: string
  canRemove: boolean
  readOnly?: boolean
  height?: '16' | '24'
  onLabelChange: (label: string) => void
  onColorChange: (color: string) => void
  onRemove: () => void
}

function TierRowChip({
  label,
  color,
  canRemove,
  readOnly = false,
  height = '16',
  onLabelChange,
  onColorChange,
  onRemove,
}: TierRowChipProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const chipCls = height === '24' ? 'h-24 w-24' : 'h-16 w-20'
  const chipClassName = cn(
    'group/chip relative flex shrink-0 items-center justify-center rounded font-heading text-sm font-bold text-white',
    chipCls
  )

  if (readOnly) {
    return (
      <div
        className={chipClassName}
        style={{ background: color }}
        aria-label={`Tier ${label}`}
      >
        <span className="line-clamp-2 px-1 text-center text-xs leading-tight break-words select-none">
          {label}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      className={chipClassName}
      style={{ background: color }}
      aria-label={`Tier ${label}`}
      initial="rest"
      whileHover="hover"
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
          className="w-[4.5rem] rounded bg-transparent text-center text-xs font-bold text-white outline-none placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/60"
          maxLength={20}
          aria-label="Edit tier label"
        />
      ) : (
        <span
          role="button"
          tabIndex={0}
          onDoubleClick={startEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              startEdit()
            }
          }}
          className="line-clamp-2 cursor-text rounded px-1 text-center text-xs leading-tight break-words select-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
          title="Double-click or press Enter to rename"
        >
          {label}
        </span>
      )}

      <Popover>
        <div className="absolute bottom-0 left-0 size-11">
          <PopoverTrigger
            aria-label="Change tier color"
            className="flex h-full w-full items-center justify-center rounded-sm border border-white/30 bg-black/20 text-white hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
          >
            <Palette size={9} aria-hidden="true" />
          </PopoverTrigger>
        </div>
        <PopoverContent
          side="right"
          sideOffset={8}
          align="start"
          className="w-64 p-3"
          initialFocus={false}
        >
          <ColorPicker value={color} onChange={onColorChange}>
            <ColorPickerSelection />
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper />
              <div className="flex w-full flex-col gap-2">
                <ColorPickerHue />
                <ColorPickerAlpha />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <ColorPickerOutput />
              <ColorPickerFormat />
            </div>
          </ColorPicker>
        </PopoverContent>
      </Popover>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0 -right-2 flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
          aria-label="Remove row"
        >
          <X size={9} aria-hidden="true" />
        </button>
      )}
    </motion.div>
  )
}

type TierBoardProps = {
  rowMinHeight?: '16' | '24'
  boardRef?: React.RefObject<HTMLElement | null>
  mode?: 'structure' | 'fill'
}

export function TierBoard({
  rowMinHeight = '16',
  boardRef,
  mode = 'structure',
}: TierBoardProps) {
  const rows = useTierEditor((s) => s.rows)
  const removeItem = useTierEditor((s) => s.removeItem)
  const addRow = useTierEditor((s) => s.addRow)
  const updateRow = useTierEditor((s) => s.updateRow)
  const removeRow = useTierEditor((s) => s.removeRow)

  const isStructure = mode === 'structure'
  const lg = rowMinHeight === '24'
  const itemCls = lg ? 'h-20 w-20' : 'h-12 w-12'
  const rowHeightCls = lg ? 'min-h-24' : 'min-h-16'
  const imgSize = lg ? 80 : 48

  return (
    <section ref={boardRef} className="flex flex-col gap-1.5">
      {rows.map((row, index) => (
        <motion.div
          key={row.id}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={staggerIndex(index) * STAGGER_DELAY}
          className="flex items-stretch gap-1.5"
          data-testid="tier-row"
        >
          <TierRowChip
            label={row.label}
            color={row.color}
            height={rowMinHeight}
            readOnly={!isStructure}
            canRemove={isStructure && rows.length > 1}
            onLabelChange={(label) => updateRow(row.id, { label })}
            onColorChange={(color) => updateRow(row.id, { color })}
            onRemove={() => removeRow(row.id)}
          />
          <Droppable
            droppableId={droppableIdForRow(row.id)}
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                role="list"
                aria-label={`${row.label} tier items`}
                className={cn(
                  `flex ${rowHeightCls} flex-1 flex-wrap items-center gap-1.5 rounded border border-border bg-surface px-2 py-1.5 transition-colors`,
                  snapshot.isDraggingOver && 'border-primary/40 bg-primary/5'
                )}
                data-testid="tier-row-droppable"
              >
                {row.items.length === 0 && !snapshot.isDraggingOver && (
                  <span className="text-xs text-muted-foreground">
                    Drag items here
                  </span>
                )}
                <TooltipProvider>
                  {row.items.map((item, index) => (
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
                          className={cn(
                            'group/item relative shrink-0 rounded-sm',
                            itemCls,
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none'
                          )}
                          data-testid="row-item"
                        >
                          <motion.div
                            initial="rest"
                            variants={dragActiveVariants}
                            animate={
                              dragSnapshot.isDragging ? 'dragging' : 'idle'
                            }
                            whileHover="hover"
                            className="relative h-full w-full overflow-hidden rounded border border-border bg-background"
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
                                    width={imgSize}
                                    height={imgSize}
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>{item.label}</TooltipContent>
                              </Tooltip>
                            ) : item.status === 'uploading' ? (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Loader2 size={12} className="animate-spin" />
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-destructive/20 text-destructive">
                                <X size={12} />
                              </div>
                            )}
                            {isStructure && (
                              <motion.button
                                type="button"
                                variants={hoverRevealVariants}
                                whileFocus="hover"
                                onClick={() =>
                                  removeItem({
                                    source: 'row',
                                    id: item.id,
                                    rowId: row.id,
                                  })
                                }
                                className="absolute top-0 right-0 rounded bg-background/80 p-0.5 text-muted-foreground hover:text-foreground"
                                aria-label={`Remove ${item.label}`}
                              >
                                <X size={10} />
                              </motion.button>
                            )}
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
        </motion.div>
      ))}

      {isStructure && rows.length < 10 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="mt-1 h-11 w-fit gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Plus size={14} />
          Add row
        </Button>
      )}
    </section>
  )
}

import type { ReactNode } from 'react'

type DroppableProvided = {
  innerRef: () => void
  droppableProps: { 'data-rfd-droppable-id'?: string }
  placeholder: null
}

type DroppableSnapshot = {
  isDraggingOver: boolean
}

type DraggableProvided = {
  innerRef: () => void
  draggableProps: { style?: undefined }
  dragHandleProps: { 'data-rfd-drag-handle'?: boolean }
}

export function DragDropContext({ children }: { children: ReactNode }) {
  return children
}

export function Droppable({
  children,
}: {
  children: (provided: DroppableProvided, snapshot: DroppableSnapshot) => ReactNode
}) {
  return children(
    { innerRef: () => undefined, droppableProps: {}, placeholder: null },
    { isDraggingOver: false }
  )
}

export function Draggable({
  children,
}: {
  children: (
    provided: DraggableProvided,
    snapshot: { isDragging: boolean }
  ) => ReactNode
}) {
  return children(
    {
      innerRef: () => undefined,
      draggableProps: {},
      dragHandleProps: {},
    },
    { isDragging: false }
  )
}

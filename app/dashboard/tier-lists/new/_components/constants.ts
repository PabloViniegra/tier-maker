export const BANK_DROPPABLE = 'bank'
export const ROW_PREFIX = 'row:'

export function droppableIdForRow(id: string): string {
  return `${ROW_PREFIX}${id}`
}

export function isRowDroppableId(value: string): boolean {
  return value.startsWith(ROW_PREFIX)
}

export function rowIdFromDroppableId(value: string): string {
  return value.slice(ROW_PREFIX.length)
}

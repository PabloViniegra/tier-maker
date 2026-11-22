export const BANK_DROPPABLE = 'bank'
const ROW_PREFIX = 'row:'

export function droppableIdForRow(id: string): string {
  return `${ROW_PREFIX}${id}`
}

export function rowIdFromDroppableId(value: string): string {
  return value.slice(ROW_PREFIX.length)
}

import type { Mock } from 'vitest'

export function asMock<T>(value: T): Mock {
  /* SAFETY: Vitest aliases replace these production bindings with vi.fn() at runtime. */
  return value as Mock
}

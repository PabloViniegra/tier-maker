import { vi } from 'vitest'

export const revalidatePath = vi.fn()
export const revalidateTag = vi.fn()

export function unstable_cache<T>(fn: T): T {
  return fn
}

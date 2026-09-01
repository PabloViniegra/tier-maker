import { vi } from 'vitest'

export const drizzleAdapter = vi.fn(() => ({ type: 'drizzle' }))

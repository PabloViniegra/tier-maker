import { vi } from 'vitest'

export const mockSend = vi.fn()

export class Resend {
  emails = { send: mockSend }
}

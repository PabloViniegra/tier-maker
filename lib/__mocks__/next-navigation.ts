import { vi } from 'vitest'

export const mockPush = vi.fn()
export const mockRefresh = vi.fn()
export const mockReplace = vi.fn()

export function useRouter() {
  return { push: mockPush, refresh: mockRefresh, replace: mockReplace }
}

export function usePathname() {
  return '/'
}

export const useSearchParams = vi.fn(() => new URLSearchParams())

export const redirect = vi.fn()
export const notFound = vi.fn()

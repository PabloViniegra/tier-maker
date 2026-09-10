export const E2E_SLUG_PREFIX = 'playwright-e2e-'
export const E2E_USER_EMAIL_PREFIX = `${E2E_SLUG_PREFIX}user-`
export const E2E_PUBLIC_TITLE = 'Playwright public tier list'
export const E2E_OWNER_TITLE = 'Playwright editor tier list'
export const E2E_ITEM_LABEL = 'Playwright test item'
export const E2E_IMAGE_URL =
  'https://playwright.public.blob.vercel-storage.com/e2e-item.png'
export const E2E_CLIENT_IP = '198.51.100.42'

export function createRunId() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

export function createFixtureSlug(runId: string, kind: 'public' | 'owner') {
  return `${E2E_SLUG_PREFIX}${runId}-${kind}`
}

export function createFixtureEmail(runId: string) {
  return `${E2E_USER_EMAIL_PREFIX}${runId}@example.test`
}

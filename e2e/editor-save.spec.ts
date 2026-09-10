import { expect, test } from '@playwright/test'
import { E2E_IMAGE_URL, E2E_ITEM_LABEL, E2E_OWNER_TITLE } from './test-data'

test.use({ storageState: 'playwright/.auth/user.json' })

const fixtureImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)

test('owners can move an item and recover the saved placement', async ({
  page,
}) => {
  const tierId = process.env.E2E_OWNER_TIER_ID
  if (!tierId) throw new Error('E2E_OWNER_TIER_ID is not available')

  await page.route(E2E_IMAGE_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: fixtureImage,
    })
  )
  await page.goto(`/dashboard/tier-lists/${tierId}`)
  await expect(
    page.getByRole('heading', { name: E2E_OWNER_TITLE })
  ).toBeVisible()

  const target = page.getByRole('list', { name: 'S tier items' })
  await page
    .getByRole('button', { name: E2E_ITEM_LABEL })
    .dragTo(target, { steps: 10 })
  await expect(target.getByRole('img', { name: E2E_ITEM_LABEL })).toBeVisible()
  await expect(
    page.getByRole('status').filter({ hasText: /^Saved$/ })
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('list', { name: 'S tier items' }).getByRole('img', {
      name: E2E_ITEM_LABEL,
    })
  ).toBeVisible()
})

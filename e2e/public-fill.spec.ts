import { expect, test } from '@playwright/test'
import { E2E_ITEM_LABEL } from './test-data'

const fixtureImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)

test('anonymous visitors can place an item and keep it after a reload', async ({
  page,
}) => {
  const slug = process.env.E2E_PUBLIC_SLUG
  if (!slug) throw new Error('E2E_PUBLIC_SLUG is not available')

  await page.route('https://playwright.public.blob.vercel-storage.com/**', (
    route
  ) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: fixtureImage,
    })
  )
  await page.goto(`/explore/${slug}`)
  await expect(
    page.getByRole('status').filter({ hasText: 'Ready to edit' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Accept' }).click({ force: true })
  expect(await page.evaluate(() => localStorage.getItem('cookie-consent'))).toBe(
    'accepted'
  )

  const target = page.getByRole('list', { name: 'S tier items' })
  const source = page.getByRole('button', { name: E2E_ITEM_LABEL })
  await source.dragTo(target, { steps: 10 })
  await expect(target.getByRole('img', { name: E2E_ITEM_LABEL })).toBeVisible()
  await expect(
    page.getByRole('status').filter({ hasText: 'Saved on this device' })
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('list', { name: 'S tier items' }).getByRole('img', {
      name: E2E_ITEM_LABEL,
    })
  ).toBeVisible()
})

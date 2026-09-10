import { request, type FullConfig } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  clearE2EData,
  loadEnvironment,
  seedUser,
  seedTierList,
  withDatabase,
} from './database'
import {
  createFixtureEmail,
  createFixtureSlug,
  createRunId,
  E2E_OWNER_TITLE,
  E2E_PUBLIC_TITLE,
  E2E_CLIENT_IP,
} from './test-data'

export default async function globalSetup(config: FullConfig) {
  loadEnvironment()
  const baseURL = config.projects[0]?.use.baseURL
  if (!baseURL) throw new Error('Playwright E2E baseURL is not configured')

  const runId = createRunId()
  const publicSlug = createFixtureSlug(runId, 'public')
  const ownerSlug = createFixtureSlug(runId, 'owner')
  const email = createFixtureEmail(runId)
  const password = `E2E-${crypto.randomUUID()}-Aa1!`
  const authStatePath = resolve('playwright/.auth/user.json')

  await withDatabase(clearE2EData)

  const ownerTierId = await withDatabase(async (database) => {
    const userId = await seedUser(database, { email, password })
    await seedTierList(database, {
      title: E2E_PUBLIC_TITLE,
      slug: publicSlug,
      creatorId: null,
    })
    return seedTierList(database, {
      title: E2E_OWNER_TITLE,
      slug: ownerSlug,
      creatorId: userId,
    })
  })

  await mkdir(dirname(authStatePath), { recursive: true })
  const apiContext = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      origin: baseURL,
      'x-forwarded-for': E2E_CLIENT_IP,
    },
  })
  try {
    const signInResponse = await apiContext.post('/api/auth/sign-in/email', {
      data: { email, password },
    })
    if (!signInResponse.ok()) {
      throw new Error(
        `Could not sign in the E2E user: ${await signInResponse.text()}`
      )
    }
    await apiContext.storageState({ path: authStatePath })
  } finally {
    await apiContext.dispose()
  }

  process.env.E2E_PUBLIC_SLUG = publicSlug
  process.env.E2E_OWNER_TIER_ID = ownerTierId
}

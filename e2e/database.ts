import { existsSync } from 'node:fs'
import ws from 'ws'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { sql } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import {
  E2E_CLIENT_IP,
  E2E_IMAGE_URL,
  E2E_ITEM_LABEL,
  E2E_SLUG_PREFIX,
  E2E_USER_EMAIL_PREFIX,
} from './test-data'

type E2EDatabase = ReturnType<typeof drizzle>

export function loadEnvironment() {
  if (!process.env.DATABASE_URI && existsSync('.env.local')) {
    process.loadEnvFile('.env.local')
  }
  if (!process.env.DATABASE_URI) {
    throw new Error(
      'Playwright E2E requires DATABASE_URI in the environment or .env.local'
    )
  }
}

export async function withDatabase<T>(
  operation: (database: E2EDatabase) => Promise<T>
) {
  loadEnvironment()
  neonConfig.webSocketConstructor = ws
  const pool = new Pool({ connectionString: process.env.DATABASE_URI! })
  const database = drizzle(pool)

  try {
    return await operation(database)
  } finally {
    await pool.end()
  }
}

export async function clearE2EData(database: E2EDatabase) {
  await database.execute(
    sql`DELETE FROM tier_templates WHERE slug LIKE ${`${E2E_SLUG_PREFIX}%`}`
  )
  await database.execute(
    sql`DELETE FROM "user" WHERE email LIKE ${`${E2E_USER_EMAIL_PREFIX}%`}`
  )
  await database.execute(
    sql`DELETE FROM "rateLimit" WHERE key = ${`${E2E_CLIENT_IP}|/sign-in/email`}`
  )
}

export async function seedUser(
  database: E2EDatabase,
  input: { email: string; password: string }
): Promise<string> {
  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(input.password)
  const now = new Date()

  await database.execute(sql`
    INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
    VALUES (${id}, ${'Playwright E2E User'}, ${input.email}, true, ${now}, ${now})
  `)
  await database.execute(sql`
    INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${id}, ${'credential'}, ${id}, ${passwordHash}, ${now}, ${now})
  `)

  return id
}

export async function seedTierList(
  database: E2EDatabase,
  input: { title: string; slug: string; creatorId: string | null }
) {
  const id = crypto.randomUUID()
  const items = JSON.stringify([{ url: E2E_IMAGE_URL, label: E2E_ITEM_LABEL }])
  await database.execute(sql`
    INSERT INTO tier_templates
      (id, title, slug, description, category, creator_id, sidebar_items, is_public)
    VALUES
      (${id}, ${input.title}, ${input.slug}, ${'Playwright fixture'}, ${'E2E'}, ${input.creatorId}, ${items}::jsonb, true)
  `)

  const rows = [
    { label: 'S', color: 'oklch(0.65 0.22 250)' },
    { label: 'A', color: 'oklch(0.65 0.20 145)' },
  ]
  for (const [order, tier] of rows.entries()) {
    await database.execute(sql`
      INSERT INTO tier_rows (id, template_id, label, color, "order", items)
      VALUES (${crypto.randomUUID()}, ${id}, ${tier.label}, ${tier.color}, ${order}, ${'[]'}::jsonb)
    `)
  }

  return id
}

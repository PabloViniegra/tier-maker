import { describe, it, expect, vi, beforeAll } from "vitest"

vi.mock("./db", () => ({ db: {} }))

vi.mock("better-auth", () => ({
  betterAuth: vi.fn((config: Record<string, unknown>) => ({
    handler: vi.fn(),
    api: {},
    _config: config,
  })),
}))

vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(() => ({ type: "drizzle" })),
}))

describe("auth — module shape", () => {
  let auth: typeof import("./auth")["auth"]
  let betterAuthMock: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    const mod = await import("./auth")
    auth = mod.auth
    const { betterAuth } = await import("better-auth")
    betterAuthMock = betterAuth as ReturnType<typeof vi.fn>
  })

  it("exports an auth instance", () => {
    expect(auth).toBeDefined()
  })

  it("auth has a handler function", () => {
    expect(typeof auth.handler).toBe("function")
  })

  it("auth has an api object", () => {
    expect(auth.api).toBeDefined()
  })

  it("betterAuth was called with emailAndPassword enabled", () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.emailAndPassword?.enabled).toBe(true)
  })

  it("betterAuth was called with a database adapter", () => {
    const config = betterAuthMock.mock.calls[0][0]
    expect(config.database).toBeDefined()
  })
})

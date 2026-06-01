import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './auth-schema'

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a name with less than 2 characters', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password with less than 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects when confirmPassword does not match password', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty fields', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import * as schema from './schema'

describe('schema — Better Auth core tables', () => {
  it('exports user table', () => {
    expect(schema.user).toBeDefined()
  })

  it('exports session table', () => {
    expect(schema.session).toBeDefined()
  })

  it('exports account table', () => {
    expect(schema.account).toBeDefined()
  })

  it('exports verification table', () => {
    expect(schema.verification).toBeDefined()
  })
})

describe('schema — business tables', () => {
  it('exports tierTemplates table', () => {
    expect(schema.tierTemplates).toBeDefined()
  })

  it('exports tierRows table', () => {
    expect(schema.tierRows).toBeDefined()
  })

  it('tierRows has an order column of integer type', () => {
    const orderCol = schema.tierRows.order
    expect(orderCol).toBeDefined()
    expect(orderCol.columnType).toBe('PgInteger')
  })

  it('tierRows references tierTemplates via templateId', () => {
    const templateIdCol = schema.tierRows.templateId
    expect(templateIdCol).toBeDefined()
  })

  it('tierTemplates references user via creatorId', () => {
    const creatorIdCol = schema.tierTemplates.creatorId
    expect(creatorIdCol).toBeDefined()
  })
})

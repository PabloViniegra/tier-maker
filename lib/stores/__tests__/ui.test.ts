import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useUIStore } from '../ui'

beforeEach(() => {
  localStorage.clear()
  useUIStore.setState({ sidebarCollapsed: false })
})

afterEach(() => {
  localStorage.clear()
  useUIStore.setState({ sidebarCollapsed: false })
})

describe('useUIStore — initial state', () => {
  it('starts with sidebar expanded', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })
})

describe('useUIStore — toggleSidebar', () => {
  it('collapses an expanded sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })

  it('expands a collapsed sidebar', () => {
    useUIStore.setState({ sidebarCollapsed: true })
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })
})

describe('useUIStore — setSidebarCollapsed', () => {
  it('sets collapsed to true', () => {
    useUIStore.getState().setSidebarCollapsed(true)
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })

  it('sets collapsed to false', () => {
    useUIStore.setState({ sidebarCollapsed: true })
    useUIStore.getState().setSidebarCollapsed(false)
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })
})

describe('useUIStore — localStorage rehydration', () => {
  it('restores collapsed state from storage', async () => {
    localStorage.setItem(
      'ui-preferences',
      JSON.stringify({ state: { sidebarCollapsed: true }, version: 0 })
    )
    await useUIStore.persist.rehydrate()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })
})

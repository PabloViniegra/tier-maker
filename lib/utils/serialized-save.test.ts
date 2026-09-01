import { describe, it, expect } from 'vitest'
import { createSerializedSaver } from './serialized-save'

describe('createSerializedSaver', () => {
  it('saves the latest value when calls overlap', async () => {
    const saved: number[] = []
    let release!: () => void
    const first = new Promise<void>((resolve) => {
      release = resolve
    })
    let calls = 0

    const enqueue = createSerializedSaver(async (value: number) => {
      calls += 1
      if (calls === 1) await first
      saved.push(value)
    })

    const p1 = enqueue(1)
    const p2 = enqueue(2)
    const p3 = enqueue(3)
    release()
    await Promise.all([p1, p2, p3])

    expect(saved).toEqual([1, 3])
  })

  it('runs a single save when calls do not overlap', async () => {
    const saved: number[] = []
    const enqueue = createSerializedSaver(async (value: number) => {
      saved.push(value)
    })
    await enqueue(1)
    await enqueue(2)
    expect(saved).toEqual([1, 2])
  })
})

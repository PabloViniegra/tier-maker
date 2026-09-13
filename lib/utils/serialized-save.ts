export function createSerializedSaver<T>(
  save: (value: T) => Promise<void>
): (value: T) => Promise<void> {
  let inFlight: Promise<void> | null = null
  let pending: T | undefined
  let queued = false

  return function enqueue(value: T): Promise<void> {
    pending = value
    queued = true
    if (inFlight) return inFlight
    inFlight = (async () => {
      try {
        while (queued) {
          queued = false
          const next = pending
          if (next === undefined) break
          await save(next)
        }
      } finally {
        inFlight = null
      }
    })()
    return inFlight
  }
}

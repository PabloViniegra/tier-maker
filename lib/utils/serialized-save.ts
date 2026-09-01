export function createSerializedSaver<T>(
  save: (value: T) => Promise<void>
): (value: T) => Promise<void> {
  let inFlight = false
  let pending: T | undefined
  let queued = false

  return async function enqueue(value: T) {
    pending = value
    queued = true
    if (inFlight) return
    inFlight = true
    try {
      while (queued) {
        queued = false
        const next = pending
        if (next === undefined) break
        await save(next)
      }
    } finally {
      inFlight = false
    }
  }
}

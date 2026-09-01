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
        await save(pending as T)
      }
    } finally {
      inFlight = false
    }
  }
}

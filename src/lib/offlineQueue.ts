/**
 * Offline queue for vendor check-in actions (Epic 27.3)
 * Stores pending actions in localStorage and flushes when back online.
 */

export type OfflineAction = {
  id: string
  bookingId: string
  vendorId: string
  action: 'check_in' | 'no_show'
  createdAt: string
}

const STORAGE_KEY = 'pulau_offline_checkins'

function loadQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OfflineAction[]) : []
  } catch {
    return []
  }
}

function saveQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.warn('Failed to persist offline queue', err)
  }
}

export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>): OfflineAction {
  const queue = loadQueue()

  // Prevent duplicate entries for the same booking/action pair
  const existing = queue.find(
    (item) => item.bookingId === action.bookingId && item.vendorId === action.vendorId && item.action === action.action
  )

  if (existing) {
    return existing
  }

  const entry: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  queue.push(entry)
  saveQueue(queue)
  return entry
}

export function dequeueById(id: string): void {
  const queue = loadQueue().filter(item => item.id !== id)
  saveQueue(queue)
}

export function getPendingActions(): OfflineAction[] {
  return loadQueue()
}

/**
 * Clear all queued actions (useful for tests or manual reset).
 */
export function clearOfflineQueue(): void {
  saveQueue([])
}

/**
 * Flush the queue by calling the provided executor for each action.
 * Removes successfully processed actions; leaves failures for retry.
 */
export async function flushOfflineQueue(
  executor: (action: OfflineAction) => Promise<void>
): Promise<{ processed: number; remaining: number }> {
  const queue = loadQueue()
  let processed = 0
  const remaining: OfflineAction[] = []

  for (const action of queue) {
    try {
      await executor(action)
      processed += 1
    } catch (err) {
      console.warn('Failed to flush offline action', action, err)
      remaining.push(action)
    }
  }

  saveQueue(remaining)
  return { processed, remaining: remaining.length }
}

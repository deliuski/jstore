import { useSyncExternalStore } from 'react'

export interface LiveResult<T> {
  data: T | undefined
  error: Error | null
  loading: boolean
}

/** Starts a realtime listener; returns its unsubscribe function. */
export type LiveSource<T> = (next: (data: T) => void, fail: (error: Error) => void) => () => void

type Subscribe = (onChange: () => void) => () => void

interface Entry {
  result: LiveResult<unknown>
  listeners: Set<() => void>
  stop: (() => void) | null
  stopTimer: ReturnType<typeof setTimeout> | null
}

const LOADING: LiveResult<never> = { data: undefined, error: null, loading: true }
const entries = new Map<string, Entry>()
const subscribers = new Map<string, Subscribe>()
const noopSubscribe: Subscribe = () => () => {}

// Keep a listener alive briefly after the last component unmounts, so moving
// between pages that read the same data doesn't restart the Firestore query.
const STOP_DELAY_MS = 30_000

function getEntry(key: string): Entry {
  let entry = entries.get(key)
  if (!entry) {
    entry = { result: LOADING, listeners: new Set(), stop: null, stopTimer: null }
    entries.set(key, entry)
  }
  return entry
}

/** One stable subscribe function per key, as useSyncExternalStore requires. */
function subscriberFor(key: string, source: LiveSource<unknown>): Subscribe {
  let subscribe = subscribers.get(key)
  if (subscribe) return subscribe

  subscribe = (onChange) => {
    const entry = getEntry(key)
    entry.listeners.add(onChange)
    if (entry.stopTimer) {
      clearTimeout(entry.stopTimer)
      entry.stopTimer = null
    }
    if (!entry.stop) {
      const publish = (result: LiveResult<unknown>) => {
        entry.result = result
        entry.listeners.forEach((listener) => listener())
      }
      entry.stop = source(
        (data) => publish({ data, error: null, loading: false }),
        (error) => publish({ data: entry.result.data, error, loading: false }),
      )
    }
    return () => {
      entry.listeners.delete(onChange)
      if (entry.listeners.size > 0) return
      entry.stopTimer = setTimeout(() => {
        entry.stop?.()
        entries.delete(key)
      }, STOP_DELAY_MS)
    }
  }
  subscribers.set(key, subscribe)
  return subscribe
}

/**
 * Shares one realtime listener per `key` between every component that uses it.
 * The same key must always be used with the same source.
 * Pass `key = null` to skip (e.g. until the user is known to be an admin).
 */
export function useLive<T>(key: string | null, source: LiveSource<T>): LiveResult<T> {
  const subscribe = key === null ? noopSubscribe : subscriberFor(key, source as LiveSource<unknown>)
  const getSnapshot = () => (key === null ? LOADING : getEntry(key).result) as LiveResult<T>
  return useSyncExternalStore(subscribe, getSnapshot)
}

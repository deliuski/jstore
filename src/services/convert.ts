import { Timestamp } from 'firebase/firestore'

/** Firestore Timestamp → Date (anything else → null). */
export function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

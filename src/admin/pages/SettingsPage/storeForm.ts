import { isValidPhone } from '../../../models/order'
import type { LatLng, StoreSettings } from '../../../models/settings'

/** The store settings as the form edits them: plain strings, the address one line per row. */
export interface StoreForm {
  name: string
  address: string
  phone: string
  hours: string
  facebookUrl: string
  instagramUrl: string
  messengerUrl: string
  lat: string
  lng: string
  mapZoom: string
}

export type StoreFormField = keyof StoreForm
export type StoreFormErrors = Partial<Record<StoreFormField, string>>

export type ParsedStoreForm = { ok: true; settings: StoreSettings } | { ok: false; errors: StoreFormErrors }

export const MAP_ZOOM_LEVELS = [13, 14, 15, 16, 17, 18]

const URL_FIELDS = ['facebookUrl', 'instagramUrl', 'messengerUrl'] as const

// 6 decimals ≈ 10 cm — plenty for a shop's pin, and short enough to read.
const COORDINATE_DECIMALS = 6

export function formatCoordinate(value: number): string {
  return String(Number(value.toFixed(COORDINATE_DECIMALS)))
}

/** "47.9186" → 47.9186; empty, not a number or beyond ±limit → null. */
function parseCoordinate(value: string, limit: number): number | null {
  const text = value.trim()
  const number = Number(text)
  return text !== '' && Number.isFinite(number) && Math.abs(number) <= limit ? number : null
}

/** The pin position typed in the form, or null while either coordinate is invalid. */
export function formLocation(form: Pick<StoreForm, 'lat' | 'lng'>): LatLng | null {
  const lat = parseCoordinate(form.lat, 90)
  const lng = parseCoordinate(form.lng, 180)
  return lat === null || lng === null ? null : { lat, lng }
}

/** "47.918607, 106.917702" as copied from Google Maps → both coordinates (rounded like a map click); anything else → null. */
export function parseCoordinatePair(text: string): { lat: string; lng: string } | null {
  const match = /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/.exec(text)
  return match ? { lat: formatCoordinate(Number(match[1])), lng: formatCoordinate(Number(match[2])) } : null
}

function clampZoom(zoom: number): number {
  const min = MAP_ZOOM_LEVELS[0]
  const max = MAP_ZOOM_LEVELS[MAP_ZOOM_LEVELS.length - 1]
  return Math.min(max, Math.max(min, Math.round(zoom)))
}

function isHttpsUrl(value: string): boolean {
  if (!value.startsWith('https://')) return false
  try {
    return new URL(value).hostname.includes('.')
  } catch {
    return false
  }
}

export function toForm(settings: StoreSettings): StoreForm {
  return {
    name: settings.name,
    address: settings.addressLines.join('\n'),
    phone: settings.phone,
    hours: settings.hours,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    messengerUrl: settings.messengerUrl,
    lat: formatCoordinate(settings.location.lat),
    lng: formatCoordinate(settings.location.lng),
    mapZoom: String(clampZoom(settings.mapZoom)),
  }
}

export function formsEqual(a: StoreForm, b: StoreForm): boolean {
  return (Object.keys(a) as StoreFormField[]).every((field) => a[field] === b[field])
}

/** Validates the form and, when it is valid, converts it back to settings (trimmed, empty address rows dropped). */
export function parseForm(form: StoreForm): ParsedStoreForm {
  const errors: StoreFormErrors = {}
  const value = (field: StoreFormField) => form[field].trim()
  const required = (field: StoreFormField, message: string) => {
    if (!value(field)) errors[field] = message
  }

  const addressLines = form.address
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  required('name', 'Дэлгүүрийн нэрийг оруулна уу')
  if (addressLines.length === 0) errors.address = 'Хаягаа оруулна уу'
  if (!isValidPhone(form.phone)) errors.phone = '8 оронтой утасны дугаар оруулна уу'
  required('hours', 'Цагийн хуваариа оруулна уу')
  for (const field of URL_FIELDS) {
    if (!isHttpsUrl(value(field))) errors[field] = 'Холбоос «https://» гэж эхэлсэн байх ёстой'
  }

  const lat = parseCoordinate(form.lat, 90)
  const lng = parseCoordinate(form.lng, 180)
  if (lat === null) errors.lat = '-90-ээс 90 хүртэлх тоо оруулна уу'
  if (lng === null) errors.lng = '-180-аас 180 хүртэлх тоо оруулна уу'

  if (lat === null || lng === null || Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    settings: {
      name: value('name'),
      addressLines,
      phone: value('phone'),
      hours: value('hours'),
      location: { lat, lng },
      mapZoom: clampZoom(Number(form.mapZoom)),
      facebookUrl: value('facebookUrl'),
      instagramUrl: value('instagramUrl'),
      messengerUrl: value('messengerUrl'),
    },
  }
}

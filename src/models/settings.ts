export interface LatLng {
  lat: number
  lng: number
}

/** `settings/store` — contact details shown in the footer and on the location page. */
export interface StoreSettings {
  name: string
  addressLines: string[]
  phone: string
  hours: string
  location: LatLng
  mapZoom: number
  facebookUrl: string
  instagramUrl: string
  messengerUrl: string
}

/** `settings/shipment` — the next incoming shipment and its pre-order capacity. */
export interface ShipmentSettings {
  arrivalAt: Date | null
  preorderCapacity: number
}

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100069854440923'

/** Used until the admin saves settings (and as the seed for `settings/store`). */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'ДҮҮХЭЭ гутлын дэлгүүр',
  addressLines: ['3-4 хороолол', 'Өргөө кино театр эсрэг талд', 'ДҮҮХЭЭ гутлын дэлгүүр'],
  phone: '9996 1353',
  hours: 'Өдөр бүр: 10:00–21:00',
  // Temporary: Ulaanbaatar centre. Set the exact spot in Admin → Тохиргоо.
  location: { lat: 47.9186, lng: 106.9177 },
  mapZoom: 16,
  facebookUrl: FACEBOOK_URL,
  instagramUrl: FACEBOOK_URL,
  messengerUrl: FACEBOOK_URL,
}

export const DEFAULT_SHIPMENT_SETTINGS: ShipmentSettings = {
  arrivalAt: null,
  preorderCapacity: 30,
}

/** Google Maps directions to the store. */
export function directionsUrl(location: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
}

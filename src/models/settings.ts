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

/** The text shown above the title on a hero slide. */
export type HeroKicker = 'ШИНЭ ИРСЭН' | 'ОНЦЛОХ'

export interface HeroSettings {
  /** Small uppercase line above the title ("ШИНЭ ИРСЭН", "ОНЦЛОХ"). */
  kicker: HeroKicker
  /** The big headline; empty = the product's name. */
  title: string
  /** Huge outlined word behind the product; empty = the product's mark. */
  ghost: string
  /** "ХУДАЛДАЖ АВАХ" button label. */
  ctaLabel: string
  /** Custom banner photo; empty = each product's own main photo. */
  image: string
}

/** One storefront banner slide (`banners/{id}`). */
export interface Banner {
  id: string
  /** Small uppercase line above the title. */
  kicker: string
  /** The big headline. */
  title: string
  /** Huge outlined word behind the product. */
  ghost: string
  /** Banner photo (a Firebase Storage URL); empty = the linked product's photo. */
  image: string
  /** The product the CTA opens; empty = catalog. */
  productId: string
  /** Lower comes first. */
  sortOrder: number
}

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100069854440923'

/** Used until the admin saves settings (and as the seed for `settings/store`). */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'JORDAN гутлын их дэлгүүр',
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

/** Used until the admin saves hero settings (and as the seed for `settings/hero`). */
export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  kicker: 'ШИНЭ ИРСЭН',
  title: '',
  ghost: '',
  ctaLabel: 'ХУДАЛДАЖ АВАХ',
  image: '',
}

/** A blank banner, used by the admin "add banner" form. */
export function emptyBanner(sortOrder: number): Omit<Banner, 'id'> {
  return {
    kicker: 'ШИНЭ ИРСЭН',
    title: '',
    ghost: '',
    image: '',
    productId: '',
    sortOrder,
  }
}

/** Google Maps directions to the store. */
export function directionsUrl(location: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
}

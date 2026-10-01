import { Timestamp, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  DEFAULT_HERO_SETTINGS,
  DEFAULT_SHIPMENT_SETTINGS,
  DEFAULT_STORE_SETTINGS,
  type Banner,
  type HeroSettings,
  type ShipmentSettings,
  type StoreSettings,
} from '../models/settings'
import { toDate, toNumber, toString, toStringArray } from './convert'

const storeRef = doc(db, 'settings', 'store')
const shipmentRef = doc(db, 'settings', 'shipment')
const heroRef = doc(db, 'settings', 'hero')
const bannersCol = collection(db, 'banners')

/** Missing fields fall back to the defaults, so a partial document still works. */
function storeFromDoc(data: DocumentData | undefined): StoreSettings {
  const d = DEFAULT_STORE_SETTINGS
  if (!data) return d
  const location = data.location ?? {}
  const addressLines = toStringArray(data.addressLines)
  return {
    name: toString(data.name, d.name),
    addressLines: addressLines.length > 0 ? addressLines : d.addressLines,
    phone: toString(data.phone, d.phone),
    hours: toString(data.hours, d.hours),
    location: { lat: toNumber(location.lat, d.location.lat), lng: toNumber(location.lng, d.location.lng) },
    mapZoom: toNumber(data.mapZoom, d.mapZoom),
    facebookUrl: toString(data.facebookUrl, d.facebookUrl),
    instagramUrl: toString(data.instagramUrl, d.instagramUrl),
    messengerUrl: toString(data.messengerUrl, d.messengerUrl),
  }
}

function shipmentFromDoc(data: DocumentData | undefined): ShipmentSettings {
  if (!data) return DEFAULT_SHIPMENT_SETTINGS
  return {
    arrivalAt: toDate(data.arrivalAt),
    preorderCapacity: toNumber(data.preorderCapacity, DEFAULT_SHIPMENT_SETTINGS.preorderCapacity),
  }
}

function heroFromDoc(data: DocumentData | undefined): HeroSettings {
  if (!data) return DEFAULT_HERO_SETTINGS
  return {
    kicker: data.kicker === 'ОНЦЛОХ' ? 'ОНЦЛОХ' : 'ШИНЭ ИРСЭН',
    title: toString(data.title),
    ghost: toString(data.ghost),
    ctaLabel: toString(data.ctaLabel, DEFAULT_HERO_SETTINGS.ctaLabel),
    image: toString(data.image),
  }
}

export function subscribeStoreSettings(next: (settings: StoreSettings) => void, fail: (error: Error) => void) {
  return onSnapshot(storeRef, (snapshot) => next(storeFromDoc(snapshot.data())), fail)
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  await setDoc(storeRef, settings)
}

export function subscribeShipment(next: (settings: ShipmentSettings) => void, fail: (error: Error) => void) {
  return onSnapshot(shipmentRef, (snapshot) => next(shipmentFromDoc(snapshot.data())), fail)
}

export async function saveShipment(settings: ShipmentSettings): Promise<void> {
  await setDoc(shipmentRef, {
    arrivalAt: settings.arrivalAt ? Timestamp.fromDate(settings.arrivalAt) : null,
    preorderCapacity: settings.preorderCapacity,
  })
}

export function subscribeHeroSettings(next: (settings: HeroSettings) => void, fail: (error: Error) => void) {
  return onSnapshot(heroRef, (snapshot) => next(heroFromDoc(snapshot.data())), fail)
}

export async function saveHeroSettings(settings: HeroSettings): Promise<void> {
  await setDoc(heroRef, settings)
}

/* ---------- Banners ---------- */

function bannerFromDoc(id: string, data: DocumentData): Banner {
  return {
    id,
    kicker: toString(data.kicker, 'ШИНЭ ИРСЭН'),
    title: toString(data.title),
    ghost: toString(data.ghost),
    image: toString(data.image),
    productId: toString(data.productId),
    sortOrder: toNumber(data.sortOrder, 100),
  }
}

/** Every banner, lowest `sortOrder` first. */
export function subscribeBanners(next: (banners: Banner[]) => void, fail: (error: Error) => void) {
  return onSnapshot(
    query(bannersCol, orderBy('sortOrder')),
    (snapshot) => next(snapshot.docs.map((d) => bannerFromDoc(d.id, d.data()))),
    fail,
  )
}

/** Creates (id = null) or updates a banner. */
export async function saveBanner(id: string | null, banner: Omit<Banner, 'id'>): Promise<void> {
  if (id) {
    await setDoc(doc(bannersCol, id), banner)
    return
  }
  await setDoc(doc(bannersCol), banner)
}

export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(bannersCol, id))
}

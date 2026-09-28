import { Timestamp, doc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  DEFAULT_SHIPMENT_SETTINGS,
  DEFAULT_STORE_SETTINGS,
  type ShipmentSettings,
  type StoreSettings,
} from '../models/settings'
import { toDate, toNumber, toString, toStringArray } from './convert'

const storeRef = doc(db, 'settings', 'store')
const shipmentRef = doc(db, 'settings', 'shipment')

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

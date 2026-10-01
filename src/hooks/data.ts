import { useLive, type LiveResult } from '../lib/liveQuery'
import type { Order } from '../models/order'
import type { Product } from '../models/product'
import {
  DEFAULT_HERO_SETTINGS,
  DEFAULT_SHIPMENT_SETTINGS,
  DEFAULT_STORE_SETTINGS,
  type Banner,
  type HeroSettings,
  type ShipmentSettings,
  type StoreSettings,
} from '../models/settings'
import { subscribeAdminState, type AdminState } from '../services/auth'
import { subscribeEmailSubscribers } from '../services/emailSubscribers'
import { subscribeOrders } from '../services/orders'
import { subscribeAllProducts, subscribeCatalog } from '../services/products'
import {
  subscribeBanners,
  subscribeHeroSettings,
  subscribeShipment,
  subscribeStoreSettings,
} from '../services/settings'
import type { EmailSubscriber } from '../models/email'

/*
 * Realtime data hooks. Each key is one shared Firestore listener, so any number
 * of components can call these without extra reads.
 */

/** Storefront products (active + coming soon), sorted. */
export function useCatalog(): LiveResult<Product[]> {
  return useLive('catalog', subscribeCatalog)
}

/** Contact details / map location — falls back to the defaults while loading. */
export function useStoreSettings(): StoreSettings {
  return useLive('settings/store', subscribeStoreSettings).data ?? DEFAULT_STORE_SETTINGS
}

/** Hero section text — falls back to the defaults while loading. */
export function useHeroSettings(): HeroSettings {
  return useLive('settings/hero', subscribeHeroSettings).data ?? DEFAULT_HERO_SETTINGS
}

/** Storefront banners, lowest `sortOrder` first. */
export function useBanners(): LiveResult<Banner[]> {
  return useLive('banners', subscribeBanners)
}

export function useShipment(): LiveResult<ShipmentSettings> & { settings: ShipmentSettings } {
  const result = useLive('settings/shipment', subscribeShipment)
  return { ...result, settings: result.data ?? DEFAULT_SHIPMENT_SETTINGS }
}

export function useAdminState(): LiveResult<AdminState> {
  return useLive('auth/admin', subscribeAdminState)
}

/** Admin only — pass `enabled = false` until the user is known to be an admin. */
export function useAllProducts(enabled = true): LiveResult<Product[]> {
  return useLive(enabled ? 'products/all' : null, subscribeAllProducts)
}

/** Admin only — every order, newest first. */
export function useOrders(enabled = true): LiveResult<Order[]> {
  return useLive(enabled ? 'orders/all' : null, subscribeOrders)
}

/** Admin only — all email subscribers captured from product pages. */
export function useEmailSubscribers(enabled = true): LiveResult<EmailSubscriber[]> {
  return useLive(enabled ? 'emails/subscribers' : null, subscribeEmailSubscribers)
}

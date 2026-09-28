import { useLive, type LiveResult } from '../lib/liveQuery'
import type { Order } from '../models/order'
import type { Product } from '../models/product'
import {
  DEFAULT_SHIPMENT_SETTINGS,
  DEFAULT_STORE_SETTINGS,
  type ShipmentSettings,
  type StoreSettings,
} from '../models/settings'
import { subscribeAdminState, type AdminState } from '../services/auth'
import { subscribeOrders } from '../services/orders'
import { subscribeAllProducts, subscribeCatalog } from '../services/products'
import { subscribeShipment, subscribeStoreSettings } from '../services/settings'

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

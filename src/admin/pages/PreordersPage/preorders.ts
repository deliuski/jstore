import type { Order, OrderItem } from '../../../models/order'
import type { ShipmentSettings } from '../../../models/settings'
import { formatTime, fromDateInput, toDateInput } from '../OrdersPage/dates'

/** Pre-orders waiting on the shipment — the same orders the dashboard counts against the capacity. */
export function activePreorders(orders: Order[]): Order[] {
  return orders.filter((order) => order.preorder && order.status !== 'cancelled')
}

/** "12 сул орон үлдсэн" / "Багтаамж дүүрсэн" / "Багтаамжаас 3 ш хэтэрсэн". */
export function capacityNote(booked: number, capacity: number): string {
  if (booked < capacity) return `${capacity - booked} сул орон үлдсэн`
  if (booked === capacity) return 'Багтаамж дүүрсэн'
  return `Багтаамжаас ${booked - capacity} ш хэтэрсэн`
}

export interface SupplierSize {
  /** `null` for one-size items. */
  size: string | null
  qty: number
}

export interface SupplierGroup {
  productId: string
  item: Pick<OrderItem, 'name' | 'image' | 'imageFit' | 'mark'>
  sizes: SupplierSize[]
  total: number
}

const sizeOrder = (size: string | null) => (size === null ? 0 : Number.parseFloat(size) || 0)

/** What to order from the supplier: pre-ordered items per product (by name), with the quantity per size. */
export function supplierGroups(orders: Order[]): SupplierGroup[] {
  const groups = new Map<string, SupplierGroup>()
  for (const item of orders.flatMap((order) => order.items)) {
    let group = groups.get(item.productId)
    if (!group) {
      group = { productId: item.productId, item, sizes: [], total: 0 }
      groups.set(item.productId, group)
    }
    const size = group.sizes.find((entry) => entry.size === item.size)
    if (size) size.qty += item.qty
    else group.sizes.push({ size: item.size, qty: item.qty })
    group.total += item.qty
  }
  const sorted = [...groups.values()].sort((a, b) => a.item.name.localeCompare(b.item.name))
  for (const group of sorted) group.sizes.sort((a, b) => sizeOrder(a.size) - sizeOrder(b.size))
  return sorted
}

/** "EU 42 × 2", or "× 2" for one-size items. */
export function sizeQtyLabel({ size, qty }: SupplierSize): string {
  return size === null ? `× ${qty}` : `EU ${size} × ${qty}`
}

/** Plain-text list to paste into a message to the supplier. */
export function supplierText(groups: SupplierGroup[]): string {
  const lines = groups.map((group) => `${group.item.name} — ${group.sizes.map(sizeQtyLabel).join(', ')}`)
  const total = groups.reduce((sum, group) => sum + group.total, 0)
  return [...lines, `Нийт: ${total} ш`].join('\n')
}

/** The shipment form's values, as the date / time / number inputs hold them. */
export interface ShipmentDraft {
  day: string
  time: string
  capacity: number | null
}

export type ShipmentErrors = Partial<Record<keyof ShipmentDraft, string>>

export function toShipmentDraft(settings: ShipmentSettings): ShipmentDraft {
  const { arrivalAt } = settings
  return {
    day: toDateInput(arrivalAt),
    time: arrivalAt ? formatTime(arrivalAt) : '',
    capacity: settings.preorderCapacity,
  }
}

export function sameDraft(a: ShipmentDraft, b: ShipmentDraft): boolean {
  return a.day === b.day && a.time === b.time && a.capacity === b.capacity
}

/** Settings to save, or the field errors. An empty date means "not scheduled yet". */
export function parseShipmentDraft(
  draft: ShipmentDraft,
): { settings: ShipmentSettings; errors: null } | { settings: null; errors: ShipmentErrors } {
  const errors: ShipmentErrors = {}
  let arrivalAt: Date | null = null
  if (draft.day && !draft.time) errors.time = 'Ирэх цагийг оруулна уу'
  else if (!draft.day && draft.time) errors.day = 'Ирэх өдрийг оруулна уу'
  else if (draft.day) {
    arrivalAt = fromDateInput(draft.day, draft.time)
    if (!arrivalAt) errors.day = 'Огноо буруу байна'
  }
  if (draft.capacity === null) errors.capacity = 'Багтаамжийг оруулна уу'
  else if (!Number.isInteger(draft.capacity) || draft.capacity < 0) errors.capacity = '0 буюу түүнээс их бүхэл тоо оруулна уу'

  if (Object.keys(errors).length > 0 || draft.capacity === null) return { settings: null, errors }
  return { settings: { arrivalAt, preorderCapacity: draft.capacity }, errors: null }
}

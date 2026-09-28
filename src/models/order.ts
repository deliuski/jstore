export type OrderStatus = 'new' | 'awaiting_payment' | 'paid' | 'shipping' | 'delivered' | 'cancelled'
export type PaymentMethod = 'bonum'
/** Payment itself is confirmed later through Bonum; until then it stays 'pending'. */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type DeliveryMethod = 'delivery' | 'pickup'

export interface OrderItem {
  productId: string
  name: string
  image: string | null
  imageFit: 'contain' | 'cover'
  mark: string
  /** EU size; `null` for one-size items. */
  size: string | null
  /** Unit price at the time of ordering (`null` if the product had no price yet). */
  price: number | null
  qty: number
}

export interface OrderCustomer {
  name: string
  phone: string
}

export interface OrderDelivery {
  method: DeliveryMethod
  /** Ulaanbaatar district; empty for pickup. */
  district: string
  address: string
  note: string
}

export interface OrderPayment {
  method: PaymentMethod
  status: PaymentStatus
  /** Payment gateway (Bonum). */
  provider: 'bonum' | null
  /** Bonum invoice id (or the transaction id on the webhook). */
  reference: string | null
}

export interface Order {
  /** Firestore document id — the order number as a string. */
  id: string
  number: number
  items: OrderItem[]
  /** `null` while any item has no price. */
  subtotal: number | null
  customer: OrderCustomer
  delivery: OrderDelivery
  payment: OrderPayment
  status: OrderStatus
  /** Ordered from "Удахгүй ирнэ" products (arrives with the next shipment). */
  preorder: boolean
  /** Planned delivery day, set by the admin. */
  deliverBy: Date | null
  /** Whether the items were already taken out of stock (see updateOrderStatus). */
  stockDeducted: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

/** The very first order gets this number; after that `counters/orders` counts up. */
export const FIRST_ORDER_NUMBER = 1001

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Шинэ',
  awaiting_payment: 'Төлбөр хүлээгдэж буй',
  paid: 'Төлсөн',
  shipping: 'Хүргэлтэнд',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцалсан',
}

/** Admin status dropdown order. */
export const ORDER_STATUS_FLOW: OrderStatus[] = ['new', 'awaiting_payment', 'paid', 'shipping', 'delivered', 'cancelled']

/** Statuses where the goods have left (or are reserved from) stock. */
export const STOCK_DEDUCTED_STATUSES: OrderStatus[] = ['paid', 'shipping', 'delivered']

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bonum: 'Онлайн төлбөр (Bonum)',
}

/** Shown on the dashboard's new-order summary. */
export const PAYMENT_METHOD_SHORT: Record<PaymentMethod, string> = {
  bonum: 'Онлайн',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Хүлээгдэж буй',
  paid: 'Төлөгдсөн',
  failed: 'Амжилтгүй',
  refunded: 'Буцаасан',
}

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  delivery: 'Хүргэлтээр',
  pickup: 'Дэлгүүрээс очиж авах',
}

export const UB_DISTRICTS = [
  'Баянгол',
  'Баянзүрх',
  'Сонгинохайрхан',
  'Сүхбаатар',
  'Хан-Уул',
  'Чингэлтэй',
  'Налайх',
  'Багануур',
  'Багахангай',
]

/** "Хан-Уул", or "Очиж авна" / "Очиж авсан" for pickup orders. */
export function deliveryLabel(order: Order): string {
  if (order.delivery.method === 'pickup') return order.status === 'delivered' ? 'Очиж авсан' : 'Очиж авна'
  return order.delivery.district
}

export function orderItemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.qty, 0)
}

/** Sum of item prices, or `null` if any item has no price yet. */
export function itemsSubtotal(items: Pick<OrderItem, 'price' | 'qty'>[]): number | null {
  let total = 0
  for (const item of items) {
    if (item.price === null) return null
    total += item.price * item.qty
  }
  return total
}

/** Valid Mongolian mobile/landline number: 8 digits (spaces and dashes allowed). */
export function isValidPhone(phone: string): boolean {
  return /^\d{8}$/.test(phone.replace(/[\s-]/g, ''))
}

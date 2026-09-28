import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  FIRST_ORDER_NUMBER,
  STOCK_DEDUCTED_STATUSES,
  itemsSubtotal,
  type DeliveryMethod,
  type Order,
  type OrderCustomer,
  type OrderDelivery,
  type OrderItem,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '../models/order'
import { toDate, toNumber, toNumberOrNull, toString } from './convert'
import { productFromDoc } from './products'

const ordersCol = collection(db, 'orders')
/** `counters/orders.last` — the most recent order number. */
export const orderCounterRef = doc(db, 'counters', 'orders')
const orderDoc = (id: string) => doc(db, 'orders', id)

const STATUSES: OrderStatus[] = ['new', 'awaiting_payment', 'paid', 'shipping', 'delivered', 'cancelled']
const METHODS: PaymentMethod[] = ['bonum']
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

function itemFromDoc(data: DocumentData): OrderItem {
  return {
    productId: toString(data.productId),
    name: toString(data.name),
    image: typeof data.image === 'string' && data.image ? data.image : null,
    imageFit: data.imageFit === 'cover' ? 'cover' : 'contain',
    mark: toString(data.mark),
    size: typeof data.size === 'string' && data.size ? data.size : null,
    price: toNumberOrNull(data.price),
    qty: Math.max(1, toNumber(data.qty, 1)),
  }
}

export function orderFromDoc(id: string, data: DocumentData): Order {
  const delivery = data.delivery ?? {}
  const payment = data.payment ?? {}
  const customer = data.customer ?? {}
  const method: DeliveryMethod = delivery.method === 'pickup' ? 'pickup' : 'delivery'
  return {
    id,
    number: toNumber(data.number, Number(id) || 0),
    items: Array.isArray(data.items) ? data.items.map(itemFromDoc) : [],
    subtotal: toNumberOrNull(data.subtotal),
    customer: { name: toString(customer.name), phone: toString(customer.phone) },
    delivery: {
      method,
      district: toString(delivery.district),
      address: toString(delivery.address),
      note: toString(delivery.note),
    },
    payment: {
      method: METHODS.includes(payment.method) ? payment.method : 'bonum',
      status: PAYMENT_STATUSES.includes(payment.status) ? payment.status : 'pending',
      provider: payment.provider === 'bonum' ? 'bonum' : null,
      reference: typeof payment.reference === 'string' ? payment.reference : null,
    },
    status: STATUSES.includes(data.status) ? data.status : 'new',
    preorder: data.preorder === true,
    deliverBy: toDate(data.deliverBy),
    stockDeducted: data.stockDeducted === true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export interface NewOrderInput {
  items: OrderItem[]
  customer: OrderCustomer
  delivery: OrderDelivery
  paymentMethod: PaymentMethod
  preorder: boolean
}

/**
 * Places a customer order. The order number comes from `counters/orders` in the
 * same transaction (the first order ever creates the counter at #1001); the
 * security rules check that the two stay in step.
 * Payment stays 'pending' until the Bonum webhook (or the admin) confirms it.
 */
export async function createOrder(input: NewOrderInput): Promise<{ number: number }> {
  if (input.items.length === 0) throw new Error('Сагс хоосон байна')
  return runTransaction(db, async (tx) => {
    const counter = await tx.get(orderCounterRef)
    const number = counter.exists() ? toNumber(counter.data().last) + 1 : FIRST_ORDER_NUMBER
    tx.set(doc(ordersCol, String(number)), {
      number,
      items: input.items,
      subtotal: itemsSubtotal(input.items),
      customer: { name: input.customer.name.trim(), phone: input.customer.phone.trim() },
      delivery: {
        method: input.delivery.method,
        district: input.delivery.method === 'pickup' ? '' : input.delivery.district,
        address: input.delivery.method === 'pickup' ? '' : input.delivery.address.trim(),
        note: input.delivery.note.trim(),
      },
      payment: { method: input.paymentMethod, status: 'pending', provider: null, reference: null },
      status: 'new',
      preorder: input.preorder,
      deliverBy: null,
      stockDeducted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    tx.set(orderCounterRef, { last: number })
    return { number }
  })
}

/** Admin: every order, newest first. */
export function subscribeOrders(next: (orders: Order[]) => void, fail: (error: Error) => void) {
  const newestFirst = query(ordersCol, orderBy('createdAt', 'desc'))
  return onSnapshot(newestFirst, (snapshot) => next(snapshot.docs.map((d) => orderFromDoc(d.id, d.data()))), fail)
}

/** The customer's own order — the success page watches its payment status. */
export function subscribeOrder(
  id: string,
  next: (order: Order | null) => void,
  fail: (error: Error) => void,
) {
  return onSnapshot(
    orderDoc(id),
    (snapshot) => next(snapshot.exists() ? orderFromDoc(snapshot.id, snapshot.data()) : null),
    fail,
  )
}

/**
 * Changes an order's status and keeps inventory in step:
 * moving into paid/shipping/delivered takes the items out of stock (once);
 * cancelling (or moving back to new/awaiting payment) puts them back.
 * Marking an order paid also marks its payment as paid.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const orderRef = doc(ordersCol, orderId)
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(orderRef)
    if (!snapshot.exists()) throw new Error('Захиалга олдсонгүй')
    const order = orderFromDoc(snapshot.id, snapshot.data())

    const shouldDeduct = STOCK_DEDUCTED_STATUSES.includes(status)
    const stockDelta = shouldDeduct && !order.stockDeducted ? -1 : !shouldDeduct && order.stockDeducted ? 1 : 0

    // Transactions need every read before the first write.
    const productIds = stockDelta === 0 ? [] : [...new Set(order.items.map((item) => item.productId))]
    const productRefs = new Map<string, DocumentReference>(productIds.map((id) => [id, doc(db, 'products', id)]))
    const productSnaps = await Promise.all([...productRefs.values()].map((ref) => tx.get(ref)))

    for (const productSnap of productSnaps) {
      if (!productSnap.exists()) continue
      const product = productFromDoc(productSnap.id, productSnap.data())
      let { stock } = product
      const sizes = product.sizes.map((size) => ({ ...size }))
      for (const item of order.items) {
        if (item.productId !== product.id) continue
        const change = item.qty * stockDelta
        const size = item.size === null ? undefined : sizes.find((s) => s.label === item.size)
        if (size) size.stock = Math.max(0, size.stock + change)
        else stock = Math.max(0, stock + change)
      }
      tx.update(productSnap.ref, { sizes, stock, updatedAt: serverTimestamp() })
    }

    tx.update(orderRef, {
      status,
      stockDeducted: stockDelta === 0 ? order.stockDeducted : stockDelta < 0,
      ...(status === 'paid' && order.payment.status !== 'paid' ? { 'payment.status': 'paid' } : {}),
      updatedAt: serverTimestamp(),
    })
  })
}

/** Sets or clears the planned delivery day. */
export async function setOrderDeliverBy(orderId: string, deliverBy: Date | null): Promise<void> {
  await updateDoc(doc(ordersCol, orderId), {
    deliverBy: deliverBy ? Timestamp.fromDate(deliverBy) : null,
    updatedAt: serverTimestamp(),
  })
}

export async function setPaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
  await updateDoc(doc(ordersCol, orderId), { 'payment.status': status, updatedAt: serverTimestamp() })
}

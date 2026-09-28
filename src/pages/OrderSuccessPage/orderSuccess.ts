import { PAYMENT_METHOD_LABELS, type PaymentMethod } from '../../models/order'

export const ORDER_SUCCESS_PATH = '/order/success'

/** Router state the checkout page hands over after placing an order. */
export interface OrderSuccessState {
  number: number
  paymentMethod: PaymentMethod
  subtotal: number | null
  preorder: boolean
  /** Digits only — shown for support calls. */
  phone: string
}

/** "10 сарын 12" */
export function formatDay(date: Date): string {
  return `${date.getMonth() + 1} сарын ${date.getDate()}`
}

/** History state survives reloads but can hold anything, so check its shape. */
export function readOrderSuccessState(state: unknown): OrderSuccessState | null {
  if (typeof state !== 'object' || state === null) return null
  const { number, paymentMethod, subtotal, preorder, phone } = state as Record<string, unknown>
  if (typeof number !== 'number' || typeof paymentMethod !== 'string' || !(paymentMethod in PAYMENT_METHOD_LABELS)) {
    return null
  }
  return {
    number,
    paymentMethod: paymentMethod as PaymentMethod,
    subtotal: typeof subtotal === 'number' ? subtotal : null,
    preorder: preorder === true,
    phone: typeof phone === 'string' ? phone : '',
  }
}

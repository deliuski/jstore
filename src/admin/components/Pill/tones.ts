import type { OrderStatus } from '../../../models/order'
import type { ProductStatus } from '../../../models/product'

export type PillTone = 'blue' | 'green' | 'red' | 'orange' | 'grey' | 'dark' | 'sand'

export const ORDER_STATUS_TONE: Record<OrderStatus, PillTone> = {
  new: 'blue',
  awaiting_payment: 'red',
  paid: 'green',
  shipping: 'orange',
  delivered: 'grey',
  cancelled: 'dark',
}

export const PRODUCT_STATUS_TONE: Record<ProductStatus, PillTone> = {
  active: 'green',
  soon: 'orange',
  draft: 'grey',
  hidden: 'dark',
}

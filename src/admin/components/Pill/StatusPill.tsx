import { ORDER_STATUS_LABELS, type OrderStatus } from '../../../models/order'
import { Pill } from './Pill'
import { ORDER_STATUS_TONE } from './tones'

/** Order status with the design colours (Шинэ blue, Төлсөн green …). */
export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Pill tone={ORDER_STATUS_TONE[status]} dot className={className}>
      {ORDER_STATUS_LABELS[status]}
    </Pill>
  )
}

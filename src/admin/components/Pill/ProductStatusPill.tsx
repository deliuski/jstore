import { STATUS_LABELS, type ProductStatus } from '../../../models/product'
import { Pill } from './Pill'
import { PRODUCT_STATUS_TONE } from './tones'

/** Product status (Идэвхтэй / Удахгүй ирнэ / Ноорог / Нуусан). */
export function ProductStatusPill({ status, className }: { status: ProductStatus; className?: string }) {
  return (
    <Pill tone={PRODUCT_STATUS_TONE[status]} dot className={className}>
      {STATUS_LABELS[status]}
    </Pill>
  )
}

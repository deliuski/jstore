import { TAG_LABELS, type ProductTag } from '../../models/product'
import { cx } from '../../lib/cx'
import s from './Badge.module.css'

/** "ШИНЭ" / "ХЯМДРАЛ" / "ДУУССАН" / "УДАХГҮЙ" label. Position and size come from `className`. */
export function Badge({ tag, className }: { tag: ProductTag; className?: string }) {
  return <span className={cx(s.badge, s[tag], className)}>{TAG_LABELS[tag]}</span>
}

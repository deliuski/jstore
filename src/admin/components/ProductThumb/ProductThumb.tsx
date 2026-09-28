import type { CSSProperties } from 'react'
import { cx } from '../../../lib/cx'
import type { Product } from '../../../models/product'
import s from './ProductThumb.module.css'

interface ProductThumbProps {
  /** A product or an order item — anything with a photo and a placeholder mark. */
  item: Pick<Product, 'image' | 'imageFit' | 'mark'>
  /** Square size in px (44 in tables, 40 in lists). */
  size?: number
  className?: string
}

/** Small square product photo, or the beige tile with the product mark ("ӨВ") until a photo exists. Decorative. */
export function ProductThumb({ item, size = 44, className }: ProductThumbProps) {
  const style = { '--thumb-size': `${size}px` } as CSSProperties
  return (
    <span className={cx(s.thumb, !item.image && s.placeholder, className)} style={style} aria-hidden="true">
      {item.image ? (
        <img className={cx(s.image, item.imageFit === 'cover' && s.cover)} src={item.image} alt="" loading="lazy" />
      ) : (
        <span className={s.mark}>{item.mark}</span>
      )}
    </span>
  )
}

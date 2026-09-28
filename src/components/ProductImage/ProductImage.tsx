import type { Product } from '../../models/product'
import { cx } from '../../lib/cx'
import s from './ProductImage.module.css'

interface ProductImageProps {
  product: Product
  /** Positions/sizes the image box. */
  className?: string
  loading?: 'eager' | 'lazy'
}

/**
 * The product photo (fitted per `product.imageFit`), or — until one is uploaded — the design's placeholder:
 * a big outlined mark ("AJ9", "ӨВӨЛ") over "[Барааны зураг]".
 * The mark size is controlled with the `--mark-size` custom property.
 */
export function ProductImage({ product, className, loading = 'lazy' }: ProductImageProps) {
  if (product.image) {
    return (
      <img
        className={cx(s.image, product.imageFit === 'cover' && s.cover, className)}
        src={product.image}
        alt={product.name}
        loading={loading}
      />
    )
  }

  return (
    <div className={cx(s.placeholder, className)} role="img" aria-label={product.name}>
      <span className={s.mark}>{product.mark}</span>
      <span className={s.caption}>[Барааны зураг]</span>
    </div>
  )
}

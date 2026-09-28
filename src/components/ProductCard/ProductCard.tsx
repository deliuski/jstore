import { Link } from 'react-router'
import { getProductTag, isSoldOut, type Product } from '../../models/product'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'
import { Badge } from '../Badge/Badge'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton'
import { ProductImage } from '../ProductImage/ProductImage'
import s from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  /** On hover (desktop), outline the card and show the size run under it. */
  showSizes?: boolean
}

export function ProductCard({ product, showSizes = false }: ProductCardProps) {
  const href = `/product/${product.id}`
  const tag = getProductTag(product)
  const sizeRun = showSizes && product.status === 'active' && !isSoldOut(product) ? product.sizes : []

  return (
    <article className={cx(s.card, showSizes && s.interactive)}>
      <div className={s.frame}>
        <div className={s.media}>
          <ProductImage product={product} className={s.image} />
          {tag && <Badge tag={tag} className={s.badge} />}
          <FavoriteButton productId={product.id} className={s.favorite} />
        </div>

        <div className={s.info}>
          <Link to={href} className={s.name}>
            {product.name}
          </Link>
          <div className={s.prices}>
            <span className={s.price}>{formatPrice(product.price)}</span>
            {tag === 'sale' && (
              <span className={s.oldPrice}>{formatPrice(product.oldPrice, '[Хуучин үнэ]')}</span>
            )}
          </div>
          <span className={s.brand}>{product.brand}</span>
        </div>
      </div>

      {sizeRun.length > 0 && (
        <div className={s.sizes}>
          {sizeRun.map((size) =>
            size.stock > 0 ? (
              <Link key={size.label} to={`${href}?size=${size.label}`} className={s.size}>
                {size.label}
              </Link>
            ) : (
              <span key={size.label} className={cx(s.size, s.sizeOff)} aria-label={`${size.label} дууссан`}>
                {size.label}
              </span>
            ),
          )}
        </div>
      )}
    </article>
  )
}

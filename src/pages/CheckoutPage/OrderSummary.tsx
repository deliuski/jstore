import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ProductImage } from '../../components/ProductImage/ProductImage'
import { CART_PATH } from '../../data/site'
import { formatPrice } from '../../lib/format'
import type { DeliveryMethod } from '../../models/order'
import { cartPieces, cartSubtotal, isPreorder, type CartLine } from '../CartPage/cartLines'
import s from './OrderSummary.module.css'

interface OrderSummaryProps {
  lines: CartLine[]
  delivery: DeliveryMethod
  /** The submit button and its messages. */
  children: ReactNode
}

/** Checkout sidebar: what is being ordered and the total. */
export function OrderSummary({ lines, delivery, children }: OrderSummaryProps) {
  const subtotal = cartSubtotal(lines)

  return (
    <aside className={s.summary} aria-labelledby="checkout-summary-title">
      <div className={s.head}>
        <h2 id="checkout-summary-title" className={s.title}>
          Таны захиалга
        </h2>
        <Link to={CART_PATH} className={s.edit}>
          Сагс засах
        </Link>
      </div>

      <ul className={s.items}>
        {lines.map(({ key, product, size, qty }) =>
          product ? (
            <li key={key} className={s.item}>
              <div className={s.thumb} aria-hidden="true">
                <ProductImage product={product} className={s.image} />
              </div>
              <div className={s.info}>
                <span className={s.name}>{product.name}</span>
                <span className={s.meta}>
                  {size && `EU ${size} · `}
                  {qty} ширхэг
                </span>
                {product.status === 'soon' && <span className={s.preorder}>Урьдчилсан захиалга</span>}
              </div>
              <span className={s.price}>{formatPrice(product.price === null ? null : product.price * qty)}</span>
            </li>
          ) : null,
        )}
      </ul>

      <dl className={s.rows}>
        <div className={s.row}>
          <dt>Бараа ({cartPieces(lines)})</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className={s.row}>
          <dt>Хүргэлт</dt>
          <dd>{delivery === 'pickup' ? 'Үнэгүй' : 'Утсаар тохирно'}</dd>
        </div>
        <div className={s.totalRow}>
          <dt>Нийт</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      {subtotal === null && (
        <p className={s.note}>Зарим барааны үнэ хараахан тогтоогоогүй — дэлгүүр захиалгыг баталгаажуулахдаа үнийг мэдэгдэнэ.</p>
      )}
      {isPreorder(lines) && (
        <p className={s.note}>Урьдчилсан захиалгын бараа дараагийн ачаагаар ирэхэд бид тантай холбогдоно.</p>
      )}

      {children}
    </aside>
  )
}

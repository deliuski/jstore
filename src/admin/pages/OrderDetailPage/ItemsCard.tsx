import { formatPrice } from '../../../lib/format'
import { orderItemCount, type Order } from '../../../models/order'
import { Card } from '../../components/Card/Card'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import s from './ItemsCard.module.css'

/** The ordered items with unit prices, line totals and the order total. */
export function ItemsCard({ order, className }: { order: Order; className?: string }) {
  return (
    <Card title="Бараа" headerExtra={<span className={s.count}>{orderItemCount(order)} ш</span>} className={className}>
      <ul className={s.list}>
        {order.items.map((item, index) => (
          <li key={`${index}:${item.productId}:${item.size ?? ''}`} className={s.row}>
            <ProductThumb item={item} size={56} />
            <div className={s.info}>
              <p className={s.name}>{item.name}</p>
              <p className={s.meta}>
                <span className={s.size}>{item.size ? `EU ${item.size}` : 'Нэг размер'}</span>
                <span>
                  {item.qty} × {formatPrice(item.price)}
                </span>
              </p>
            </div>
            <p className={s.lineTotal}>{formatPrice(item.price === null ? null : item.price * item.qty)}</p>
          </li>
        ))}
      </ul>
      <p className={s.subtotal}>
        Нийт дүн
        <span className={s.subtotalValue}>{formatPrice(order.subtotal)}</span>
      </p>
    </Card>
  )
}

import { Link, useLocation } from 'react-router'
import { cx } from '../../../lib/cx'
import { formatPrice } from '../../../lib/format'
import { PAYMENT_METHOD_LABELS, deliveryLabel, orderItemCount, type Order } from '../../../models/order'
import t from '../../components/DataTable/DataTable.module.css'
import { StatusPill } from '../../components/Pill/StatusPill'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import { formatShortDateTime } from './dates'
import { orderPath, type BackLink } from './orders'
import s from './OrdersTable.module.css'

interface OrdersTableProps {
  orders: Order[]
  /** Label of the order page's back link, which returns to this list as it is now (filters, page). */
  backLabel: string
  /** The "Урьдчилсан" tag under pre-order numbers (off where every row is a pre-order). */
  preorderTag?: boolean
}

/** Order rows in the style of the dashboard's recent orders; separate cards on phones. Each row opens the order. */
export function OrdersTable({ orders, backLabel, preorderTag = true }: OrdersTableProps) {
  const { pathname, search } = useLocation()
  const back: BackLink = { to: pathname + search, label: backLabel }

  return (
    <div className={cx(t.scroller, s.scroller)}>
      <table className={cx(t.table, s.table)}>
        <thead>
          <tr>
            <th scope="col">Захиалга</th>
            <th scope="col">Бараа</th>
            <th scope="col" className={s.size}>
              Размер
            </th>
            <th scope="col">Үйлчлүүлэгч</th>
            <th scope="col" className={t.right}>
              Дүн
            </th>
            <th scope="col" className={s.payment}>
              Төлбөр
            </th>
            <th scope="col">Төлөв</th>
            <th scope="col" className={s.delivery}>
              Хүргэлт
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const [item] = order.items
            const delivery = deliveryLabel(order)
            return (
              <tr key={order.id} className={cx(t.clickable, s.row)}>
                <td className={s.numberCell}>
                  <Link to={orderPath(order.id)} state={{ back }} className={cx(t.rowLink, s.number)}>
                    #{order.number}
                  </Link>
                  <span className={s.date}>{formatShortDateTime(order.createdAt)}</span>
                  {preorderTag && order.preorder && <span className={s.preorder}>Урьдчилсан</span>}
                </td>
                <td className={s.productCell}>
                  {item ? (
                    <span className={s.product}>
                      <ProductThumb item={item} />
                      <span className={s.productText}>
                        <span className={s.productName} title={item.name}>
                          {item.name}
                          {order.items.length > 1 && <span className={s.more}> +{order.items.length - 1}</span>}
                        </span>
                        <span className={s.meta}>
                          {item.size && <span className={s.metaSize}>EU {item.size} · </span>}
                          {orderItemCount(order)} ш
                        </span>
                      </span>
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className={cx(t.num, s.size)}>{item?.size ?? '—'}</td>
                <td className={s.customer}>
                  <span className={s.customerName}>{order.customer.name || '—'}</span>
                  {order.customer.phone && <span className={s.phone}>{order.customer.phone}</span>}
                </td>
                <td className={cx(t.right, s.total)}>{formatPrice(order.subtotal)}</td>
                <td className={cx(t.muted, s.payment)}>{PAYMENT_METHOD_LABELS[order.payment.method]}</td>
                <td className={s.status}>
                  <StatusPill status={order.status} />
                </td>
                <td className={cx(t.muted, s.delivery)} title={delivery}>
                  {delivery || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

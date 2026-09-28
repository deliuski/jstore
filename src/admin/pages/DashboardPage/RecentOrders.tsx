import { useState } from 'react'
import { Link } from 'react-router'
import { cx } from '../../../lib/cx'
import { PAYMENT_METHOD_LABELS, deliveryLabel, type Order, type OrderStatus } from '../../../models/order'
import { Card } from '../../components/Card/Card'
import t from '../../components/DataTable/DataTable.module.css'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FilterChips, type ChipOption } from '../../components/FilterChips/FilterChips'
import { StatusPill } from '../../components/Pill/StatusPill'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import s from './RecentOrders.module.css'

type Filter = 'all' | Extract<OrderStatus, 'new' | 'paid' | 'shipping'>

const FILTERS: ChipOption<Filter>[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'new', label: 'Шинэ' },
  { value: 'paid', label: 'Төлсөн' },
  { value: 'shipping', label: 'Хүргэлтэнд' },
]

const ROWS = 7

/** "Сүүлийн захиалгууд": the newest orders, filterable by status. `orders` come newest first. */
export function RecentOrders({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const rows = orders.filter((order) => filter === 'all' || order.status === filter).slice(0, ROWS)

  return (
    <Card
      title="Сүүлийн захиалгууд"
      headerExtra={<FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Төлөвөөр шүүх" />}
    >
      {rows.length === 0 ? (
        <EmptyState title="Захиалга алга" text="Энэ төлөвтэй захиалга одоогоор байхгүй байна." />
      ) : (
        <div className={cx(t.scroller, s.scroller)}>
          <table className={cx(t.table, s.table)}>
            <thead>
              <tr>
                <th scope="col">Захиалга</th>
                <th scope="col">Бараа</th>
                <th scope="col">Размер</th>
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
              {rows.map((order) => {
                const [item] = order.items
                const delivery = deliveryLabel(order)
                return (
                  <tr key={order.id} className={t.clickable}>
                    <td className={s.number}>
                      <Link to={`/admin/orders/${order.id}`} className={t.rowLink}>
                        #{order.number}
                      </Link>
                    </td>
                    <td className={s.productCell}>
                      {item ? (
                        <span className={s.product}>
                          <ProductThumb item={item} />
                          <span className={s.productName} title={item.name}>
                            {item.name}
                            {order.items.length > 1 && <span className={s.more}> +{order.items.length - 1}</span>}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={cx(t.num, s.size)}>{item?.size ?? '—'}</td>
                    <td className={cx(t.muted, s.payment)}>{PAYMENT_METHOD_LABELS[order.payment.method]}</td>
                    <td className={s.status}>
                      <StatusPill status={order.status} />
                    </td>
                    <td className={cx(t.muted, s.delivery)} title={delivery}>
                      {delivery}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

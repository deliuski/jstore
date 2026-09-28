import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PlusIcon } from '../../../components/icons'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAllProducts, useOrders } from '../../../hooks/data'
import { lowStockEntries } from '../../../models/product'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { ButtonLink } from '../../components/Button/ButtonLink'
import { BellIcon, HourglassIcon, LayersIcon, ReceiptIcon, TruckIcon } from '../../components/icons'
import { SearchField } from '../../components/SearchField/SearchField'
import { adminTitle } from '../../components/title'
import { formatDashboardDate, isSameDay, paymentSummary, useNow } from './dashboard'
import { LowStockCard } from './LowStockCard'
import { RecentOrders } from './RecentOrders'
import { ShipmentCard } from './ShipmentCard'
import { StatCard } from './StatCard'
import s from './DashboardPage.module.css'

export function DashboardPage() {
  const navigate = useNavigate()
  const now = useNow()
  const [query, setQuery] = useState('')
  const orders = useOrders(true)
  const products = useAllProducts(true)

  const allOrders = orders.data ?? []
  const newOrders = allOrders.filter((order) => order.status === 'new')
  const awaiting = allOrders.filter((order) => order.status === 'awaiting_payment')
  const shipping = allOrders.filter((order) => order.status === 'shipping')
  const shippingToday = shipping.filter((order) => order.deliverBy && isSameDay(order.deliverBy, now)).length
  const lowStock = lowStockEntries(products.data ?? []).length

  const search = (value: string) => navigate(value ? `/admin/orders?q=${encodeURIComponent(value)}` : '/admin/orders')

  return (
    <>
      <title>{adminTitle('Самбар')}</title>
      <AdminPageHeader
        title="Өнөөдөр"
        subtitle={formatDashboardDate(now)}
        actions={
          <>
            <SearchField
              className={s.search}
              value={query}
              onChange={setQuery}
              onSubmit={search}
              placeholder="Захиалга, бараа хайх"
            />
            <Link
              to="/admin/orders?status=new"
              className={s.bell}
              aria-label={newOrders.length > 0 ? `Шинэ захиалга: ${newOrders.length}` : 'Шинэ захиалга алга'}
            >
              <BellIcon size={18} />
              {newOrders.length > 0 && <span className={s.bellDot} />}
            </Link>
            <ButtonLink to="/admin/products/new" className={s.add} icon={<PlusIcon size={20} strokeWidth={2} />}>
              Бараа нэмэх
            </ButtonLink>
          </>
        }
      />

      {orders.error || products.error ? (
        <PageError />
      ) : orders.loading || products.loading ? (
        <PageLoader />
      ) : (
        <>
          <div className={s.stats}>
            <StatCard
              label="Шинэ захиалга"
              value={newOrders.length}
              note={paymentSummary(newOrders) || 'Шинэ захиалга алга'}
              icon={ReceiptIcon}
              to="/admin/orders?status=new"
            />
            <StatCard
              label="Төлбөр хүлээгдэж буй"
              value={awaiting.length}
              note={awaiting.length > 0 ? 'Сануулга илгээх боломжтой' : 'Хүлээгдэж буй төлбөр алга'}
              icon={HourglassIcon}
              to="/admin/orders?status=awaiting_payment"
            />
            <StatCard
              label="Хүргэлтэнд"
              value={shipping.length}
              note={`${shippingToday} нь өнөөдөр хүргэгдэнэ`}
              icon={TruckIcon}
              to="/admin/orders?status=shipping"
            />
            <StatCard
              label="Дуусаж буй размер"
              value={lowStock}
              note={lowStock > 0 ? 'Нөөц нэмэх шаардлагатай' : 'Нөөц хангалттай'}
              icon={LayersIcon}
              to="/admin/inventory"
            />
          </div>

          <div className={s.grid}>
            <RecentOrders orders={allOrders} />
            <div className={s.side}>
              <LowStockCard products={products.data ?? []} />
              <ShipmentCard orders={allOrders} now={now} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

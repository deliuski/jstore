import { useLocation, useParams } from 'react-router'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useOrders } from '../../../hooks/data'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { ButtonLink } from '../../components/Button/ButtonLink'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Pill } from '../../components/Pill/Pill'
import { StatusPill } from '../../components/Pill/StatusPill'
import { adminTitle } from '../../components/title'
import { formatDateTime } from '../OrdersPage/dates'
import { ORDERS_PATH, backLinkFrom } from '../OrdersPage/orders'
import { DeliveryCard } from './DeliveryCard'
import { InfoList } from './InfoList'
import { ItemsCard } from './ItemsCard'
import { PaymentCard } from './PaymentCard'
import { StatusCard } from './StatusCard'
import s from './OrderDetailPage.module.css'

export function OrderDetailPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { data, error, loading } = useOrders(true)
  const order = data?.find((candidate) => candidate.id === id)
  const title = order ? `Захиалга #${order.number}` : 'Захиалга'

  return (
    <>
      <title>{adminTitle(title)}</title>
      <AdminPageHeader
        title={title}
        back={backLinkFrom(state)}
        subtitle={order?.createdAt && formatDateTime(order.createdAt)}
        meta={
          order && (
            <span className={s.pills}>
              <StatusPill status={order.status} />
              {order.preorder && <Pill tone="sand">Урьдчилсан</Pill>}
            </span>
          )
        }
      />

      {error ? (
        <PageError />
      ) : loading ? (
        <PageLoader />
      ) : !order ? (
        <Card>
          <EmptyState
            title="Захиалга олдсонгүй"
            text={`#${id} дугаартай захиалга алга. Устгагдсан эсвэл холбоос буруу байж магадгүй.`}
            action={
              <ButtonLink to={ORDERS_PATH} variant="secondary" size="sm">
                Бүх захиалга
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className={s.layout}>
          <div className={s.column}>
            <ItemsCard order={order} className={s.items} />
            <DeliveryCard order={order} className={s.delivery} />
          </div>
          <div className={s.column}>
            <StatusCard order={order} className={s.status} />
            <Card title="Үйлчлүүлэгч" className={s.customer}>
              <InfoList
                items={[
                  { label: 'Нэр', value: order.customer.name || '—' },
                  {
                    label: 'Утас',
                    value: order.customer.phone ? (
                      <a href={`tel:${order.customer.phone.replace(/[^\d+]/g, '')}`} className={s.phone}>
                        {order.customer.phone}
                      </a>
                    ) : (
                      '—'
                    ),
                  },
                ]}
              />
            </Card>
            <PaymentCard order={order} className={s.payment} />
          </div>
        </div>
      )}
    </>
  )
}

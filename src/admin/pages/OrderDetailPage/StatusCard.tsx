import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../../../models/order'
import { updateOrderStatus } from '../../../services/orders'
import { Card } from '../../components/Card/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { Select } from '../../components/Form/Select'
import { useToast } from '../../components/Toast/toast'
import s from './StatusCard.module.css'

const STATUS_OPTIONS = ORDER_STATUS_FLOW.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] }))

/** Status dropdown. The service keeps stock in step with the status; cancelling asks first. */
export function StatusCard({ order, className }: { order: Order; className?: string }) {
  const toast = useToast()
  const [pending, setPending] = useState<OrderStatus | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const apply = async (status: OrderStatus) => {
    setPending(status)
    try {
      await updateOrderStatus(order.id, status)
      toast(`Төлөв: ${ORDER_STATUS_LABELS[status]}`)
    } catch {
      toast('Төлөв өөрчилж чадсангүй', 'error')
    } finally {
      setPending(null)
      setConfirmCancel(false)
    }
  }

  const choose = (status: OrderStatus) => {
    if (status === 'cancelled') setConfirmCancel(true)
    else apply(status)
  }

  return (
    <Card title="Төлөв" className={className}>
      <Select
        label="Захиалгын төлөв"
        hideLabel
        value={pending ?? order.status}
        disabled={pending !== null}
        options={STATUS_OPTIONS}
        onChange={(event) => choose(event.target.value as OrderStatus)}
        hint="Төлсөн, Хүргэлтэнд, Хүргэгдсэн болгоход бараа нөөцөөс хасагдана. Өмнөх төлөв рүү буцаах эсвэл цуцлахад нөөцөд буцаж орно."
      />
      <p className={cx(s.stock, order.stockDeducted && s.deducted)}>
        {order.stockDeducted ? 'Бараа нөөцөөс хасагдсан' : 'Бараа нөөцөөс хасагдаагүй'}
      </p>

      <ConfirmDialog
        open={confirmCancel}
        title={`#${order.number} захиалгыг цуцлах уу?`}
        message={
          order.stockDeducted
            ? 'Захиалга цуцлагдаж, нөөцөөс хасагдсан бараа нөөцөд буцаж нэмэгдэнэ.'
            : 'Захиалга цуцлагдана. Дараа нь төлөвийг дахин сольж болно.'
        }
        confirmLabel="Цуцлах"
        cancelLabel="Болих"
        busy={pending === 'cancelled'}
        onConfirm={() => apply('cancelled')}
        onCancel={() => setConfirmCancel(false)}
      />
    </Card>
  )
}

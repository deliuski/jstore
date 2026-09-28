import { useState } from 'react'
import { formatPrice } from '../../../lib/format'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type Order, type PaymentStatus } from '../../../models/order'
import { setPaymentStatus } from '../../../services/orders'
import { Card } from '../../components/Card/Card'
import { Select } from '../../components/Form/Select'
import { Notice } from '../../components/Notice/Notice'
import { useToast } from '../../components/Toast/toast'
import { InfoList, type InfoItem } from './InfoList'
import s from './PaymentCard.module.css'

const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

/** Payment method and amount, with a manual payment status until Bonum confirms payments. */
export function PaymentCard({ order, className }: { order: Order; className?: string }) {
  const toast = useToast()
  const [pending, setPending] = useState<PaymentStatus | null>(null)

  const change = async (status: PaymentStatus) => {
    setPending(status)
    try {
      await setPaymentStatus(order.id, status)
      toast(`Төлбөр: ${PAYMENT_STATUS_LABELS[status]}`)
    } catch {
      toast('Төлбөрийн төлөв хадгалж чадсангүй', 'error')
    } finally {
      setPending(null)
    }
  }

  const items: InfoItem[] = [
    { label: 'Хэлбэр', value: PAYMENT_METHOD_LABELS[order.payment.method] },
    { label: 'Дүн', value: formatPrice(order.subtotal) },
    ...(order.payment.reference ? [{ label: 'Гүйлгээ', value: order.payment.reference }] : []),
  ]

  return (
    <Card title="Төлбөр" className={className}>
      <InfoList items={items} />
      <Select
        label="Төлбөрийн төлөв"
        className={s.status}
        value={pending ?? order.payment.status}
        disabled={pending !== null}
        options={PAYMENT_STATUS_OPTIONS}
        onChange={(event) => change(event.target.value as PaymentStatus)}
      />
      <Notice className={s.notice}>
        Онлайн төлбөрийг Bonum-оор холбоно. Түүнээс өмнө төлбөр орсныг шалгаад төлөвийг эндээс гараар солино.
      </Notice>
    </Card>
  )
}

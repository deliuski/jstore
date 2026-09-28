import { useState } from 'react'
import { DELIVERY_METHOD_LABELS, type Order } from '../../../models/order'
import { setOrderDeliverBy } from '../../../services/orders'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { TextField } from '../../components/Form/TextField'
import { useToast } from '../../components/Toast/toast'
import { formatDate, fromDateInput, toDateInput } from '../OrdersPage/dates'
import { InfoList, type InfoItem } from './InfoList'
import s from './DeliveryCard.module.css'

/** Delivery details plus the planned delivery (or pickup) day. */
export function DeliveryCard({ order, className }: { order: Order; className?: string }) {
  const toast = useToast()
  // `null` = not edited, so the field follows the saved (live) value.
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { delivery } = order
  const isPickup = delivery.method === 'pickup'
  const saved = toDateInput(order.deliverBy)
  const day = draft ?? saved
  const picked = fromDateInput(day)

  const save = async (deliverBy: Date | null) => {
    setSaving(true)
    try {
      await setOrderDeliverBy(order.id, deliverBy)
      setDraft(null)
      toast(deliverBy ? `Товлосон өдөр: ${formatDate(deliverBy)}` : 'Товлосон өдрийг арилгалаа')
    } catch {
      toast('Өдрийг хадгалж чадсангүй', 'error')
    } finally {
      setSaving(false)
    }
  }

  const items: InfoItem[] = [
    { label: 'Хэлбэр', value: DELIVERY_METHOD_LABELS[delivery.method] },
    ...(isPickup
      ? []
      : [
          { label: 'Дүүрэг', value: delivery.district || '—' },
          { label: 'Хаяг', value: delivery.address || '—' },
        ]),
    ...(delivery.note ? [{ label: 'Тэмдэглэл', value: delivery.note }] : []),
  ]

  return (
    <Card title="Хүргэлт" className={className}>
      <InfoList items={items} />
      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault()
          if (picked) save(picked)
        }}
      >
        <TextField
          type="date"
          label={isPickup ? 'Очиж авах өдөр' : 'Хүргэх өдөр'}
          className={s.field}
          value={day}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className={s.actions}>
          <Button type="submit" busy={saving} disabled={!picked || day === saved}>
            Хадгалах
          </Button>
          {order.deliverBy && (
            <Button variant="ghost" disabled={saving} onClick={() => save(null)}>
              Арилгах
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

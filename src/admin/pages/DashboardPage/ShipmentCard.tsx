import { useId } from 'react'
import { Link } from 'react-router'
import { useShipment } from '../../../hooks/data'
import type { Order } from '../../../models/order'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { countdown, pad, preorderPairs } from './dashboard'
import s from './ShipmentCard.module.css'

/** Dark "Ирэх ачаа" card: countdown to the next shipment and how full its pre-order list is. */
export function ShipmentCard({ orders, now }: { orders: Order[]; now: Date }) {
  const { settings } = useShipment()
  const titleId = useId()
  const left = countdown(settings.arrivalAt, now)
  const booked = preorderPairs(orders)

  return (
    <section className={s.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.title}>
        Ирэх ачаа
      </h2>

      <div className={s.countRow}>
        {left ? (
          <>
            <p className={s.count}>
              <span aria-hidden="true">
                {pad(left.days)} : {pad(left.hours)}
              </span>
              <span className="visually-hidden">
                {left.days} өдөр {left.hours} цагийн дараа
              </span>
            </p>
            <p className={s.unit} aria-hidden="true">
              өдөр : цаг
            </p>
          </>
        ) : (
          <p className={s.unscheduled}>Товлоогүй</p>
        )}
      </div>

      <Link to="/admin/preorders" className={s.preorders}>
        Урьдчилсан захиалга
        <span className={s.booked}>
          {booked} / {settings.preorderCapacity}
        </span>
      </Link>
      <ProgressBar
        value={booked}
        max={settings.preorderCapacity}
        label="Урьдчилсан захиалгын дүүргэлт"
        onDark
        className={s.bar}
      />
    </section>
  )
}

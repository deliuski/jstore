import { useId } from 'react'
import { cx } from '../../../lib/cx'
import type { ShipmentSettings } from '../../../models/settings'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { countdown, formatDashboardDate, pad } from '../DashboardPage/dashboard'
import { formatTime } from '../OrdersPage/dates'
import { capacityNote } from './preorders'
import s from './ShipmentStatus.module.css'

interface ShipmentStatusProps {
  /** Live (saved) settings, not the form draft. */
  settings: ShipmentSettings
  /** Pre-ordered items booked on this shipment. */
  booked: number
  now: Date
  className?: string
}

/** Dark "Ирэх ачаа" panel, as on the dashboard: countdown to arrival and how full the pre-order list is. */
export function ShipmentStatus({ settings, booked, now, className }: ShipmentStatusProps) {
  const titleId = useId()
  const { arrivalAt, preorderCapacity: capacity } = settings
  const left = countdown(arrivalAt, now)
  const arrived = arrivalAt !== null && arrivalAt.getTime() <= now.getTime()

  return (
    <section className={cx(s.card, className)} aria-labelledby={titleId}>
      <h2 id={titleId} className={s.title}>
        Ирэх ачаа
      </h2>

      {left && arrivalAt ? (
        <>
          <div className={s.countRow}>
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
          </div>
          <p className={s.arrival}>
            {formatDashboardDate(arrivalAt)}, {formatTime(arrivalAt)}
            {arrived && ' · ирэх хугацаа болсон'}
          </p>
        </>
      ) : (
        <>
          <p className={s.unscheduled}>Товлоогүй</p>
          <p className={s.arrival}>Ирэх өдрийг «Ачааны тохиргоо» хэсэгт оруулна уу.</p>
        </>
      )}

      <div className={s.capacity}>
        <p className={s.capacityRow}>
          Урьдчилсан захиалга
          <span className={s.booked}>
            {booked} / {capacity}
          </span>
        </p>
        <ProgressBar value={booked} max={capacity} label="Урьдчилсан захиалгын дүүргэлт" onDark className={s.bar} />
        <p className={cx(s.free, booked >= capacity && s.full)}>{capacityNote(booked, capacity)}</p>
      </div>
    </section>
  )
}

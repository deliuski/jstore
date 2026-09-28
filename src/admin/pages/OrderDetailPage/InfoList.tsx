import type { ReactNode } from 'react'
import s from './InfoList.module.css'

export interface InfoItem {
  label: string
  value: ReactNode
}

/** Label / value rows for the customer, delivery and payment cards. */
export function InfoList({ items }: { items: InfoItem[] }) {
  return (
    <dl className={s.list}>
      {items.map((item) => (
        <div key={item.label} className={s.row}>
          <dt className={s.label}>{item.label}</dt>
          <dd className={s.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

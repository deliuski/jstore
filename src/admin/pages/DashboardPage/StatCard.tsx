import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router'
import s from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: number
  note: string
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  /** The list this number comes from. */
  to: string
}

/** One of the four summary tiles at the top of the dashboard. */
export function StatCard({ label, value, note, icon: Icon, to }: StatCardProps) {
  return (
    <Link to={to} className={s.card}>
      <span className={s.head}>
        <span className={s.label}>{label}</span>
        <Icon size={18} className={s.icon} />
      </span>
      <span className={s.value}>{value}</span>
      <span className={s.note}>{note}</span>
    </Link>
  )
}

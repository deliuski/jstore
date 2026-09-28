import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../../lib/cx'
import s from './Card.module.css'

interface CardProps {
  /** Oswald uppercase heading (rendered as `<h2>`). */
  title?: ReactNode
  /** Small underlined link in the header, e.g. `{ label: 'Бүгд', to: '/admin/inventory' }`. */
  action?: { label: string; to: string }
  /** Anything else for the header's right side (filter chips, buttons). */
  headerExtra?: ReactNode
  /** Extra class for the title (e.g. a smaller size). */
  titleClassName?: string
  className?: string
  children?: ReactNode
}

/** White rounded panel — the building block of every admin page. */
export function Card({ title, action, headerExtra, titleClassName, className, children }: CardProps) {
  const hasHeader = title || action || headerExtra
  return (
    <section className={cx(s.card, className)}>
      {hasHeader && (
        <div className={s.header}>
          {title && <h2 className={cx(s.title, titleClassName)}>{title}</h2>}
          {headerExtra}
          {action && (
            <Link to={action.to} className={s.action}>
              {action.label}
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

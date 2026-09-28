import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import s from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  text?: ReactNode
  /** e.g. a `<ButtonLink>` to create the first item. */
  action?: ReactNode
  className?: string
}

/** Centered "nothing here yet" message for empty lists and tables. */
export function EmptyState({ title, text, action, className }: EmptyStateProps) {
  return (
    <div className={cx(s.empty, className)}>
      <p className={s.title}>{title}</p>
      {text && <p className={s.text}>{text}</p>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  )
}

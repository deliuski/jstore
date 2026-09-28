import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import type { PillTone } from './tones'
import s from './Pill.module.css'

interface PillProps {
  tone?: PillTone
  /** Leading status dot (as in the order status pills). */
  dot?: boolean
  className?: string
  children: ReactNode
}

/** Rounded status label. */
export function Pill({ tone = 'grey', dot, className, children }: PillProps) {
  return (
    <span className={cx(s.pill, s[tone], className)}>
      {dot && <span className={s.dot} aria-hidden="true" />}
      {children}
    </span>
  )
}

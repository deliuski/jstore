import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './ChoiceCard.module.css'

interface ChoiceCardProps {
  /** Radio group name. */
  name: string
  value: string
  checked: boolean
  onSelect: () => void
  title: string
  children?: ReactNode
}

/** A radio button drawn as a selectable card (delivery and payment options). */
export function ChoiceCard({ name, value, checked, onSelect, title, children }: ChoiceCardProps) {
  return (
    <label className={cx(s.card, checked && s.checked)}>
      <input type="radio" className={s.radio} name={name} value={value} checked={checked} onChange={onSelect} />
      <span className={s.dot} aria-hidden="true" />
      <span className={s.body}>
        <span className={s.title}>{title}</span>
        {children && <span className={s.text}>{children}</span>}
      </span>
    </label>
  )
}

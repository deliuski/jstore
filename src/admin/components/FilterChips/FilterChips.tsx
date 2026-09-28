import { cx } from '../../../lib/cx'
import s from './FilterChips.module.css'

export interface ChipOption<T extends string> {
  value: T
  label: string
  /** Optional number shown after the label. */
  count?: number
}

interface FilterChipsProps<T extends string> {
  options: ChipOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the group, e.g. "Төлөвөөр шүүх". */
  label: string
  className?: string
}

/** The "Бүгд / Шинэ / Төлсөн / Хүргэлтэнд" pill group — one option active at a time. */
export function FilterChips<T extends string>({ options, value, onChange, label, className }: FilterChipsProps<T>) {
  return (
    <div className={cx(s.chips, className)} role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={cx(s.chip, active && s.active)}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count !== undefined && <span className={s.count}>{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

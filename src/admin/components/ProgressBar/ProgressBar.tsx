import { cx } from '../../../lib/cx'
import s from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max: number
  /** Accessible name, e.g. "Урьдчилсан захиалга". */
  label: string
  /** Darker track for dark cards. */
  onDark?: boolean
  className?: string
}

/** Thin red progress bar (pre-order capacity …). */
export function ProgressBar({ value, max, label, onDark, className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      className={cx(s.track, onDark && s.onDark, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <div className={s.fill} style={{ width: `${percent}%` }} />
    </div>
  )
}

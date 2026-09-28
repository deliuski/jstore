import { useId } from 'react'
import { cx } from '../../../lib/cx'
import s from './Form.module.css'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  disabled?: boolean
  className?: string
}

/** On/off switch (`role="switch"`) with its label and optional hint. */
export function Toggle({ label, checked, onChange, hint, disabled, className }: ToggleProps) {
  const id = useId()
  return (
    <div className={cx(s.toggle, className)}>
      <button
        id={id}
        type="button"
        role="switch"
        className={s.switch}
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      />
      <span className={s.toggleText}>
        <label htmlFor={id} className={s.toggleLabel}>
          {label}
        </label>
        {hint && (
          <span id={`${id}-hint`} className={s.hint}>
            {hint}
          </span>
        )}
      </span>
    </div>
  )
}

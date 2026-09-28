import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { WarningIcon } from '../CartPage/WarningIcon'
import s from './Field.module.css'

export interface ControlProps {
  id: string
  name: string
  className: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FieldProps {
  name: string
  label: string
  error?: string
  optional?: boolean
  className?: string
  /** Renders the input/select/textarea with the props that tie it to the label and error. */
  children: (control: ControlProps) => ReactNode
}

/** Label + form control + inline error message. */
export function Field({ name, label, error, optional = false, className, children }: FieldProps) {
  const id = `checkout-${name}`
  const errorId = `${id}-error`

  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={id} className={s.label}>
        {label}
        {optional && <span className={s.optional}> (заавал биш)</span>}
      </label>
      {children({
        id,
        name,
        className: cx(s.control, error && s.invalid),
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className={s.error}>
          <WarningIcon size={16} />
          {error}
        </p>
      )}
    </div>
  )
}

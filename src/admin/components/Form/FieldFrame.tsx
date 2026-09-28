import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import type { FieldProps } from './field'
import s from './Form.module.css'

type FieldFrameProps = FieldProps & { id: string; required?: boolean; children: ReactNode }

/** Label + control + hint/error, shared by every form control. */
export function FieldFrame({ id, label, hint, error, hideLabel, required, className, children }: FieldFrameProps) {
  const note = error || hint
  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={id} className={cx(s.label, hideLabel && 'visually-hidden')}>
        {label}
        {required && <span className={s.required}> *</span>}
      </label>
      {children}
      {note && (
        <p id={`${id}-${error ? 'error' : 'hint'}`} className={error ? s.error : s.hint}>
          {note}
        </p>
      )}
    </div>
  )
}

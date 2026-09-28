import { useId, type InputHTMLAttributes } from 'react'
import { cx } from '../../../lib/cx'
import { describedBy, type FieldProps } from './field'
import { FieldFrame } from './FieldFrame'
import s from './Form.module.css'

type TextFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

/** Labelled text input (any `type` except number — see NumberField). */
export function TextField({ label, hint, error, hideLabel, className, id, required, ...rest }: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldFrame {...{ id: fieldId, label, hint, error, hideLabel, required, className }}>
      <input
        id={fieldId}
        required={required}
        className={cx(s.control, error && s.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      />
    </FieldFrame>
  )
}

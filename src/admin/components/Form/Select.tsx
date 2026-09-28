import { useId, type SelectHTMLAttributes } from 'react'
import { cx } from '../../../lib/cx'
import { describedBy, type FieldProps } from './field'
import { FieldFrame } from './FieldFrame'
import s from './Form.module.css'

type SelectProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    /** Shortcut for simple lists; `<option>` children work too. */
    options?: { value: string; label: string }[]
  }

/** Labelled native select. */
export function Select({ label, hint, error, hideLabel, className, id, required, options, children, ...rest }: SelectProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldFrame {...{ id: fieldId, label, hint, error, hideLabel, required, className }}>
      <select
        id={fieldId}
        required={required}
        className={cx(s.control, s.select, error && s.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </FieldFrame>
  )
}

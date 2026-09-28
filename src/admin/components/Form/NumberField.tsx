import { useId } from 'react'
import { MinusIcon, PlusIcon } from '../../../components/icons'
import { cx } from '../../../lib/cx'
import { describedBy, type FieldProps } from './field'
import { FieldFrame } from './FieldFrame'
import s from './Form.module.css'

interface NumberFieldProps extends FieldProps {
  /** `null` = empty (e.g. a price that is not set yet). */
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Unit shown inside the field, e.g. "₮". */
  suffix?: string
  /** − / + buttons around the input (stock counts). */
  stepper?: boolean
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

/** Labelled number input; `stepper` adds − / + buttons. */
export function NumberField({ value, onChange, min, max, step = 1, suffix, stepper, ...field }: NumberFieldProps) {
  const { label, hint, error, hideLabel, className, id, name, placeholder, required, disabled } = field
  const autoId = useId()
  const fieldId = id ?? autoId
  const current = value ?? 0
  const stepBy = (delta: number) => onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, current + delta)))

  return (
    <FieldFrame {...{ id: fieldId, label, hint, error, hideLabel, required, className }}>
      <div className={cx(s.numberWrap, stepper && s.stepper)}>
        {stepper && (
          <button
            type="button"
            className={s.step}
            aria-label={`${label}: хасах`}
            disabled={disabled || (min !== undefined && current <= min)}
            onClick={() => stepBy(-step)}
          >
            <MinusIcon size={16} strokeWidth={2} />
          </button>
        )}
        <input
          id={fieldId}
          name={name}
          type="number"
          inputMode="numeric"
          className={cx(s.control, s.number, suffix && s.withSuffix, error && s.invalid)}
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          onChange={(event) => {
            const { value: raw, valueAsNumber } = event.target
            if (raw === '') onChange(null)
            else if (Number.isFinite(valueAsNumber)) onChange(valueAsNumber)
          }}
        />
        {suffix && <span className={s.suffix}>{suffix}</span>}
        {stepper && (
          <button
            type="button"
            className={s.step}
            aria-label={`${label}: нэмэх`}
            disabled={disabled || (max !== undefined && current >= max)}
            onClick={() => stepBy(step)}
          >
            <PlusIcon size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </FieldFrame>
  )
}

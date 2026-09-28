import { useId } from 'react'
import { SearchIcon } from '../../../components/icons'
import { cx } from '../../../lib/cx'
import s from './SearchField.module.css'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Called on Enter. Omit for filter-as-you-type. */
  onSubmit?: (value: string) => void
  placeholder: string
  /** Accessible name (defaults to the placeholder). */
  label?: string
  className?: string
}

/** Rounded search box with a magnifier icon. */
export function SearchField({ value, onChange, onSubmit, placeholder, label, className }: SearchFieldProps) {
  const id = useId()
  return (
    <form
      role="search"
      className={cx(s.search, className)}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(value.trim())
      }}
    >
      <label htmlFor={id} className="visually-hidden">
        {label ?? placeholder}
      </label>
      <SearchIcon size={16} strokeWidth={2} className={s.icon} />
      <input
        id={id}
        type="search"
        className={s.input}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, buttonIconClass, type ButtonStyle } from './buttonClass'
import s from './Button.module.css'

type ButtonProps = ButtonStyle &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    /** Icon before the label, e.g. `<PlusIcon size={16} />`. */
    icon?: ReactNode
    /** Shows a spinner and disables the button (e.g. while saving). */
    busy?: boolean
  }

/** Uppercase Oswald button (`type="button"` unless given). */
export function Button({ variant, size, block, className, icon, busy, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={buttonClass({ variant, size, block, className })}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? <span className={s.spinner} aria-hidden="true" /> : icon && <span className={buttonIconClass}>{icon}</span>}
      {children}
    </button>
  )
}

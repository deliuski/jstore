import { cx } from '../../../lib/cx'
import s from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonStyle {
  /** primary = red (default), secondary = outlined, ghost = text only, danger = outlined red. */
  variant?: ButtonVariant
  /** md = 44px (default), sm = 36px. */
  size?: 'md' | 'sm'
  /** Full width. */
  block?: boolean
  className?: string
}

/** Button classes — also for elements that must stay native, e.g. a `<label>` around a file input or an external `<a>`. */
export function buttonClass({ variant = 'primary', size = 'md', block, className }: ButtonStyle = {}): string {
  return cx(s.button, s[variant], size === 'sm' && s.sm, block && s.block, className)
}

export const buttonIconClass = s.icon

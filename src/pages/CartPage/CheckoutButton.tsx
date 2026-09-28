import { Link } from 'react-router'
import { CHECKOUT_PATH } from '../../data/site'
import { cx } from '../../lib/cx'
import s from './CheckoutButton.module.css'

interface CheckoutButtonProps {
  /** Shown (greyed out) but not clickable while the cart has problems. */
  disabled: boolean
  /** Id of the text that explains why it is disabled. */
  describedBy?: string
  className?: string
}

export function CheckoutButton({ disabled, describedBy, className }: CheckoutButtonProps) {
  if (disabled) {
    return (
      <button type="button" className={cx(s.button, className)} disabled aria-describedby={describedBy}>
        ЗАХИАЛГА ӨГӨХ
      </button>
    )
  }
  return (
    <Link to={CHECKOUT_PATH} className={cx(s.button, className)}>
      ЗАХИАЛГА ӨГӨХ
    </Link>
  )
}

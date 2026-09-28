import { BRAND } from '../../data/site'
import { cx } from '../../lib/cx'
import s from './AdminLogo.module.css'

/** Red ball mark + store name + "УДИРДЛАГА". Light text by default (dark sidebar). */
export function AdminLogo({ onLight, className }: { onLight?: boolean; className?: string }) {
  return (
    <span className={cx(s.logo, onLight && s.onLight, className)}>
      <svg className={s.mark} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" />
        <path d="M18 2.5v31M2.5 18h31" />
        <path d="M7.2 6.8c4.4 3 6.8 7 6.8 11.2s-2.4 8.2-6.8 11.2" />
        <path d="M28.8 6.8c-4.4 3-6.8 7-6.8 11.2s2.4 8.2 6.8 11.2" />
      </svg>
      <span className={s.text}>
        <span className={s.name}>{BRAND.name}</span>
        <span className={s.caption}>УДИРДЛАГА</span>
      </span>
    </span>
  )
}

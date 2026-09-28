import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import s from './AdminTheme.module.css'

/** Applies the admin tokens (`--a-*`) and page background. Wraps every admin screen. */
export function AdminTheme({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(s.theme, className)}>{children}</div>
}

import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import s from './ProductGrid.module.css'

export function ProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(s.grid, className)}>{children}</div>
}

import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import s from './Notice.module.css'

export type NoticeTone = 'info' | 'success' | 'error' | 'warning'

interface NoticeProps {
  tone?: NoticeTone
  className?: string
  children: ReactNode
}

/** Inline coloured message box (form errors, hints). Errors are announced (`role="alert"`). */
export function Notice({ tone = 'info', className, children }: NoticeProps) {
  return (
    <div className={cx(s.notice, s[tone], className)} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

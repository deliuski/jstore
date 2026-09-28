import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronLeftIcon } from '../../../components/icons'
import s from './AdminPageHeader.module.css'

interface AdminPageHeaderProps {
  /** Page `<h1>` — shown uppercase in Oswald ("Өнөөдөр" → ӨНӨӨДӨР). */
  title: ReactNode
  /** Muted text after the title (date, counts …). */
  subtitle?: ReactNode
  /** Extra inline element after the subtitle, e.g. a `<Pill>`. */
  meta?: ReactNode
  /** Right side: search, buttons. */
  actions?: ReactNode
  /** "← Захиалга" link above the title, for detail pages. */
  back?: { to: string; label: string }
}

/** The big page heading row shared by every admin page. */
export function AdminPageHeader({ title, subtitle, meta, actions, back }: AdminPageHeaderProps) {
  return (
    <header className={s.header}>
      <div className={s.heading}>
        {back && (
          <Link to={back.to} className={s.back}>
            <ChevronLeftIcon size={16} strokeWidth={2} />
            {back.label}
          </Link>
        )}
        <div className={s.titleRow}>
          <h1 className={s.title}>{title}</h1>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
          {meta}
        </div>
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </header>
  )
}

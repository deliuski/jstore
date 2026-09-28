import { Link } from 'react-router'
import s from './Breadcrumbs.module.css'

export interface Crumb {
  label: string
  /** Omitted for the current page. */
  to?: string
}

/** "Нүүр / Сагс / Захиалга" trail, styled like the product page's. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={s.breadcrumb} aria-label="Талх мөр">
      <ol className={s.crumbs}>
        {items.map((item) => (
          <li key={item.label} className={item.to ? undefined : s.current} aria-current={item.to ? undefined : 'page'}>
            {item.to ? (
              <Link to={item.to} className={s.link}>
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router'
import { CloseIcon } from '../../components/icons'
import { useStoreSettings } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { AdminLogo } from './AdminLogo'
import { ADMIN_HOME_PATH, ADMIN_NAV } from './nav'
import { UserMenu } from './UserMenu'
import s from './Sidebar.module.css'

interface SidebarProps {
  id: string
  /** Drawer state on tablet/mobile; the desktop sidebar is always shown. */
  open: boolean
  newOrders: number
  adminName: string
  onClose: () => void
}

export function Sidebar({ id, open, newOrders, adminName, onClose }: SidebarProps) {
  const { messengerUrl } = useStoreSettings()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  return (
    <aside id={id} className={cx(s.sidebar, open && s.open)} aria-label="Удирдлагын цэс">
      <div className={s.top}>
        <Link to={ADMIN_HOME_PATH} className={s.brand} onClick={onClose}>
          <AdminLogo />
          <span className="visually-hidden"> — самбар</span>
        </Link>
        <button ref={closeRef} type="button" className={s.close} aria-label="Цэс хаах" onClick={onClose}>
          <CloseIcon size={22} />
        </button>
      </div>

      <nav className={s.nav} aria-label="Удирдлага">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          if ('messenger' in item) {
            return (
              <a key={item.label} href={messengerUrl} target="_blank" rel="noopener noreferrer" className={s.link}>
                <Icon size={18} className={s.icon} />
                {item.label}
                <span className="visually-hidden"> (шинэ цонхонд)</span>
              </a>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ADMIN_HOME_PATH}
              className={({ isActive }) => cx(s.link, isActive && s.active)}
              onClick={onClose}
            >
              <Icon size={18} className={s.icon} />
              {item.label}
              {item.showNewOrders && newOrders > 0 && (
                <span className={s.badge}>
                  {newOrders}
                  <span className="visually-hidden"> шинэ</span>
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <UserMenu name={adminName} className={s.user} />
    </aside>
  )
}

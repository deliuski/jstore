import { useEffect, useRef, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { MenuIcon } from '../../components/icons'
import { useOrders } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { AdminTheme } from '../components/AdminTheme/AdminTheme'
import { ToastProvider } from '../components/Toast/ToastProvider'
import { AdminLogo } from './AdminLogo'
import { ADMIN_HOME_PATH } from './nav'
import { Sidebar } from './Sidebar'
import s from './AdminLayout.module.css'

const SIDEBAR_ID = 'admin-sidebar'

/** Sidebar (a drawer below 1024px) + the page. Only rendered for signed-in admins. */
export function AdminShell({ adminName }: { adminName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { data: orders } = useOrders(true)
  const newOrders = orders?.filter((order) => order.status === 'new').length ?? 0

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <AdminTheme className={s.shell}>
      <ToastProvider>
        <header className={s.topBar}>
          <Link to={ADMIN_HOME_PATH}>
            <AdminLogo />
            <span className="visually-hidden"> — самбар</span>
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className={s.menuButton}
            aria-label={newOrders > 0 ? `Цэс, ${newOrders} шинэ захиалга` : 'Цэс'}
            aria-expanded={menuOpen}
            aria-controls={SIDEBAR_ID}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon size={24} />
            {newOrders > 0 && <span className={s.menuDot} />}
          </button>
        </header>

        <Sidebar id={SIDEBAR_ID} open={menuOpen} newOrders={newOrders} adminName={adminName} onClose={closeMenu} />
        <div className={cx(s.backdrop, menuOpen && s.backdropVisible)} aria-hidden="true" onClick={closeMenu} />

        <main className={s.main}>
          <Outlet />
        </main>
      </ToastProvider>
    </AdminTheme>
  )
}

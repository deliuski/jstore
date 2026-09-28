import { useState } from 'react'
import { Link } from 'react-router'
import { useShop } from '../../context/shop'
import { CART_PATH, CATALOG_PATH, LOCATION_PATH, MAIN_NAV } from '../../data/site'
import { cx } from '../../lib/cx'
import { BagIcon, CloseIcon, MapPinIcon, MenuIcon, SearchIcon, UserIcon } from '../icons'
import { Logo } from '../Logo/Logo'
import s from './Header.module.css'

export function Header() {
  const { cartCount } = useShop()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <button
          type="button"
          className={cx(s.iconButton, s.menuButton)}
          aria-label={menuOpen ? 'Цэс хаах' : 'Цэс'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        <Logo />

        <nav className={s.nav} aria-label="Үндсэн цэс">
          {MAIN_NAV.map((link) => (
            <Link key={link.label} to={link.to} className={s.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={s.actions}>
          <Link to={`${CATALOG_PATH}#search`} className={s.iconButton} aria-label="Хайх">
            <SearchIcon size={22} />
          </Link>
          <Link to={LOCATION_PATH} className={cx(s.iconButton, s.wideOnly)} aria-label="Дэлгүүрийн байршил">
            <MapPinIcon size={22} />
          </Link>
          <Link to="/admin" className={cx(s.iconButton, s.wideOnly)} aria-label="Нэвтрэх">
            <UserIcon size={22} />
          </Link>
          <Link to={CART_PATH} className={s.cart} aria-label={`Сагс, ${cartCount} бараа`}>
            <BagIcon className={s.cartIcon} />({cartCount})
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className={s.mobileMenu} aria-label="Үндсэн цэс">
          {MAIN_NAV.map((link) => (
            <Link key={link.label} to={link.to} className={s.mobileLink} onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          <Link to={LOCATION_PATH} className={s.mobileLink} onClick={closeMenu}>
            Дэлгүүрийн байршил
          </Link>
        </nav>
      )}
    </header>
  )
}

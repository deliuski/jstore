import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { signOutAdmin } from '../../services/auth'
import { LogoutIcon, StoreIcon } from '../components/icons'
import { useToast } from '../components/Toast/toast'
import { initialOf } from './initial'
import s from './UserMenu.module.css'

/** The admin card at the bottom of the sidebar; opens "Дэлгүүр рүү" / "Гарах". */
export function UserMenu({ name, className }: { name: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const signOut = () => {
    signOutAdmin().catch(() => toast('Гарах үед алдаа гарлаа', 'error'))
  }

  return (
    <div ref={rootRef} className={cx(s.root, className)}>
      <div id={menuId} className={s.menu} hidden={!open}>
        <Link to="/" className={s.item}>
          <StoreIcon size={18} />
          Дэлгүүр рүү
        </Link>
        <button type="button" className={s.item} onClick={signOut}>
          <LogoutIcon size={18} />
          Гарах
        </button>
      </div>
      <button
        type="button"
        className={s.card}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={s.avatar} aria-hidden="true">
          {initialOf(name)}
        </span>
        <span className={s.text}>
          <span className={s.name}>{name}</span>
          <span className={s.role}>Админ</span>
        </span>
      </button>
    </div>
  )
}

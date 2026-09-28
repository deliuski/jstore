import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { CloseIcon } from '../../components/icons'
import s from './FilterDrawer.module.css'

interface FilterDrawerProps {
  id: string
  open: boolean
  onClose: () => void
  resultCount: number
  children: ReactNode
}

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled)'

/** Tablet/mobile slide-over for the filters: a modal <dialog>, so the page behind is inert. */
export function FilterDrawer({ id, open, onClose, resultCount, children }: FilterDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const { overflow } = document.body.style
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [open])

  // Keep Tab inside the drawer instead of letting it reach the browser UI.
  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // The panel fills the dialog, so a click on the dialog itself is a click on the backdrop.
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={s.drawer}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={closeOnBackdrop}
      onKeyDown={trapFocus}
    >
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id={`${id}-title`} className={s.title}>
            Шүүлтүүр
          </h2>
          <button type="button" className={s.close} aria-label="Шүүлтүүр хаах" onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </div>
        <div className={s.body}>{children}</div>
        <div className={s.foot}>
          <button type="button" className={s.apply} onClick={onClose}>
            Үр дүнг харах ({resultCount})
          </button>
        </div>
      </div>
    </dialog>
  )
}

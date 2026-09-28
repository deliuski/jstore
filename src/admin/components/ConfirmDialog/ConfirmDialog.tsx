import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '../Button/Button'
import s from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' (delete, cancel order) = red confirm button; 'default' = outlined. */
  tone?: 'danger' | 'default'
  /** Disables the buttons and shows a spinner while the action runs. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Modal yes/no question built on `<dialog>` (focus trap, Esc and backdrop click cancel). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Тийм',
  cancelLabel = 'Болих',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const cancel = () => {
    if (!busy) onCancel()
  }

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        cancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) cancel()
      }}
    >
      <h2 id={titleId} className={s.title}>
        {title}
      </h2>
      {message && <div className={s.message}>{message}</div>}
      <div className={s.actions}>
        <Button variant="secondary" onClick={cancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'primary' : 'secondary'} busy={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}

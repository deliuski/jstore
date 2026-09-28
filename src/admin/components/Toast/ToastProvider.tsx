import { useCallback, useRef, useState, type ReactNode } from 'react'
import { CheckIcon, CloseIcon } from '../../../components/icons'
import { cx } from '../../../lib/cx'
import { ToastContext, type ToastTone } from './toast'
import s from './Toast.module.css'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const VISIBLE_MS = 4000

/** Hosts the toasts shown with `useToast()`. Rendered once by the admin layout. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((toast) => toast.id !== id)), [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      nextId.current += 1
      const id = nextId.current
      setToasts((list) => [...list.slice(-2), { id, message, tone }])
      setTimeout(() => dismiss(id), VISIBLE_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext value={show}>
      {children}
      <div className={s.viewport} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={cx(s.toast, toast.tone === 'error' && s.error)}>
            {toast.tone === 'error' ? (
              <CloseIcon size={18} strokeWidth={2.2} className={s.icon} />
            ) : (
              <CheckIcon size={18} strokeWidth={2.2} className={s.icon} />
            )}
            <p className={s.message}>{toast.message}</p>
            <button type="button" className={s.close} aria-label="Хаах" onClick={() => dismiss(toast.id)}>
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

import { useState } from 'react'
import s from './CopyButton.module.css'

const RESET_MS = 2000

/** Copies a value (account number, transfer reference) to the clipboard. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  // The Clipboard API only exists on https/localhost.
  if (!navigator.clipboard) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), RESET_MS)
    } catch {
      // Permission denied — the value is still on screen to copy by hand.
    }
  }

  return (
    <>
      <button type="button" className={s.button} onClick={copy}>
        {copied ? 'Хуулсан' : 'Хуулах'}
        <span className="visually-hidden">{` — ${label}`}</span>
      </button>
      <span className="visually-hidden" role="status">
        {copied ? `${label} хуулагдлаа` : ''}
      </span>
    </>
  )
}

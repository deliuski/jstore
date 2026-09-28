/** Props every labelled admin field accepts. */
export interface FieldProps {
  label: string
  /** Small muted help text under the control. */
  hint?: string
  /** Validation message — also marks the control invalid. */
  error?: string
  /** Keep the label for screen readers only. */
  hideLabel?: boolean
  className?: string
}

/** `aria-describedby` for a field's hint / error paragraph (ids `${id}-hint`, `${id}-error`). */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

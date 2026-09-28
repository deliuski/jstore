import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error'

/** Shows a short message in the corner, e.g. `toast('Хадгаллаа')` or `toast(message, 'error')`. */
export type ShowToast = (message: string, tone?: ToastTone) => void

export const ToastContext = createContext<ShowToast>(() => {})

/** Inside the admin layout: returns the `toast()` function. */
export function useToast(): ShowToast {
  return useContext(ToastContext)
}

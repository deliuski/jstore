import { useEffect, useState } from 'react'
import { uploadProductImage } from '../../../services/products'
import { errorMessage } from './productForm'

export interface ImageUpload {
  busy: boolean
  /** Message of the last failed upload (e.g. Storage not enabled yet). */
  error: string | null
  /** Uploads the files one by one; returns the URLs of those that made it. */
  upload: (files: File[]) => Promise<string[]>
}

export function useImageUpload(): ImageUpload {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (files: File[]) => {
    const urls: string[] = []
    setBusy(true)
    setError(null)
    try {
      for (const file of files) urls.push(await uploadProductImage(file))
    } catch (uploadError) {
      setError(errorMessage(uploadError))
    } finally {
      setBusy(false)
    }
    return urls
  }

  return { busy, error, upload }
}

/**
 * Asks before the tab is closed or reloaded while `active`. In-app links can't be
 * blocked: `useBlocker` needs a data router and the app uses `<BrowserRouter>`.
 */
export function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}

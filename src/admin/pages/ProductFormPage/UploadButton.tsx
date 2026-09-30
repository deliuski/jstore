import { useRef } from 'react'
import { Button } from '../../components/Button/Button'
import { CameraIcon, UploadIcon } from '../ProductsPage/icons'

interface UploadButtonProps {
  label: string
  busy: boolean
  /** Progress message shown instead of the label while busy (e.g. model download). */
  progress?: string | null
  multiple?: boolean
  onFiles: (files: File[]) => void
}

/**
 * Buttons that open the file picker (and on phones the camera) for images.
 * The native inputs stay hidden; a second input with `capture` opens the camera
 * directly instead of the gallery.
 */
export function UploadButton({ label, busy, progress, multiple, onFiles }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const pick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    // Cleared so picking the same file again fires another change.
    event.target.value = ''
    if (files.length > 0) onFiles(files)
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
      {/* `capture` makes phones open the camera app directly. */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />

      <Button
        variant="secondary"
        icon={<UploadIcon size={16} />}
        busy={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (progress ?? 'Оруулж байна…') : label}
      </Button>
      <Button
        variant="secondary"
        icon={<CameraIcon size={16} />}
        busy={busy}
        onClick={() => cameraRef.current?.click()}
      >
        Камераар авах
      </Button>
    </>
  )
}

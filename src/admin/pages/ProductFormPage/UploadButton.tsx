import { useRef } from 'react'
import { Button } from '../../components/Button/Button'
import { UploadIcon } from '../ProductsPage/icons'

interface UploadButtonProps {
  label: string
  busy: boolean
  multiple?: boolean
  onFiles: (files: File[]) => void
}

/** A button that opens the file picker for images (the native input stays hidden). */
export function UploadButton({ label, busy, multiple, onFiles }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          // Cleared so picking the same file again fires another change.
          event.target.value = ''
          if (files.length > 0) onFiles(files)
        }}
      />
      <Button
        variant="secondary"
        icon={<UploadIcon size={16} />}
        busy={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Оруулж байна…' : label}
      </Button>
    </>
  )
}

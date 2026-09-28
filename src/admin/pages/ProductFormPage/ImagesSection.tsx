import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../../../components/icons'
import { cx } from '../../../lib/cx'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Select } from '../../components/Form/Select'
import { TextField } from '../../components/Form/TextField'
import { Notice } from '../../components/Notice/Notice'
import type { ImageUpload } from './formHooks'
import {
  IMAGE_FIT_OPTIONS,
  isImageSource,
  markFromName,
  moveItem,
  type DraftUpdate,
  type ProductDraft,
} from './productForm'
import { UploadButton } from './UploadButton'
import s from './ImagesSection.module.css'

interface ImagesSectionProps {
  draft: ProductDraft
  onChange: DraftUpdate
  /** Validation message for the main image URL. */
  imageError?: string
  mainUpload: ImageUpload
  galleryUpload: ImageUpload
  className?: string
}

const SOURCE_PLACEHOLDER = 'https://… эсвэл /images/products/p1.jpg'

/** "Зураг": the main photo (upload or URL, fit) and the extra gallery photos. */
export function ImagesSection({ draft, onChange, imageError, mainUpload, galleryUpload, className }: ImagesSectionProps) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)
  const [galleryUrl, setGalleryUrl] = useState('')
  const [galleryUrlError, setGalleryUrlError] = useState<string>()

  const image = draft.image.trim()
  const broken = image !== '' && brokenSrc === image
  const cover = draft.imageFit === 'cover'
  const mark = draft.mark.trim() || markFromName(draft.name)

  const uploadMain = async (files: File[]) => {
    const [url] = await mainUpload.upload(files)
    if (url) onChange({ image: url })
  }

  const uploadGallery = async (files: File[]) => {
    const urls = await galleryUpload.upload(files)
    if (urls.length > 0) onChange((current) => ({ gallery: [...current.gallery, ...urls] }))
  }

  const addGalleryUrl = () => {
    const url = galleryUrl.trim()
    if (!isImageSource(url)) {
      setGalleryUrlError('https://… холбоос эсвэл /images/… зам оруулна уу')
      return
    }
    if (draft.gallery.includes(url)) {
      setGalleryUrlError('Энэ зураг нэмэгдсэн байна')
      return
    }
    onChange((current) => ({ gallery: [...current.gallery, url] }))
    setGalleryUrl('')
    setGalleryUrlError(undefined)
  }

  const moveGallery = (from: number, to: number) =>
    onChange((current) => ({ gallery: moveItem(current.gallery, from, to) }))

  const removeGallery = (index: number) =>
    onChange((current) => ({ gallery: current.gallery.filter((_, i) => i !== index) }))

  return (
    <Card title="Зураг" className={className}>
      <div className={s.main}>
        <div className={cx(s.preview, !image && s.previewEmpty)}>
          {image && !broken ? (
            <img
              src={image}
              alt="Үндсэн зураг"
              className={cx(s.previewImage, cover && s.cover)}
              onError={() => setBrokenSrc(image)}
            />
          ) : (
            <span className={s.previewMark} aria-hidden="true">
              {mark}
            </span>
          )}
        </div>

        <div className={s.controls}>
          <div className={s.buttons}>
            <UploadButton
              label={image ? 'Зураг солих' : 'Зураг оруулах'}
              busy={mainUpload.busy}
              onFiles={uploadMain}
            />
            {image && (
              <Button variant="ghost" onClick={() => onChange({ image: '' })}>
                Зураг хасах
              </Button>
            )}
          </div>
          {mainUpload.error && (
            <Notice tone="error">
              Зураг оруулж чадсангүй: {mainUpload.error}
              <br />
              Firebase Storage идэвхжээгүй бол зургийн холбоосыг доорх талбарт буулгаж болно.
            </Notice>
          )}
          {broken && <Notice tone="warning">Энэ холбоосоор зураг ачаалагдсангүй. Холбоосоо шалгана уу.</Notice>}
          <TextField
            label="Зургийн холбоос"
            value={draft.image}
            placeholder={SOURCE_PLACEHOLDER}
            hint="Файл оруулахад автоматаар бөглөгдөнө"
            error={imageError}
            inputMode="url"
            spellCheck={false}
            onChange={(event) => onChange({ image: event.target.value })}
          />
          <Select
            label="Зургийн байрлал"
            value={draft.imageFit}
            options={IMAGE_FIT_OPTIONS}
            onChange={(event) => onChange({ imageFit: event.target.value === 'cover' ? 'cover' : 'contain' })}
          />
        </div>
      </div>

      <div className={s.gallery}>
        <div>
          <h3 className={s.subtitle}>Нэмэлт зураг</h3>
          <p className={s.hint}>Урд, ар, ул гэх мэт. Дарааллыг сумаар өөрчилнө.</p>
        </div>

        {draft.gallery.length > 0 && (
          <ul className={s.galleryList}>
            {draft.gallery.map((url, index) => {
              const name = `Нэмэлт зураг ${index + 1}`
              return (
                <li key={`${index}-${url}`} className={s.galleryItem}>
                  <img src={url} alt={name} className={cx(s.galleryImage, cover && s.cover)} loading="lazy" />
                  <div className={s.tools}>
                    <button
                      type="button"
                      className={s.tool}
                      aria-label={`${name}: өмнө нь`}
                      disabled={index === 0}
                      onClick={() => moveGallery(index, index - 1)}
                    >
                      <ChevronLeftIcon size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className={s.tool}
                      aria-label={`${name}: дараа нь`}
                      disabled={index === draft.gallery.length - 1}
                      onClick={() => moveGallery(index, index + 1)}
                    >
                      <ChevronRightIcon size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className={cx(s.tool, s.remove)}
                      aria-label={`${name}: хасах`}
                      onClick={() => removeGallery(index)}
                    >
                      <CloseIcon size={16} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className={s.add}>
          <UploadButton label="Зураг нэмэх" multiple busy={galleryUpload.busy} onFiles={uploadGallery} />
          <div className={s.urlAdd}>
            <TextField
              className={s.urlField}
              label="Холбоосоор зураг нэмэх"
              hideLabel
              value={galleryUrl}
              placeholder={SOURCE_PLACEHOLDER}
              error={galleryUrlError}
              inputMode="url"
              spellCheck={false}
              onChange={(event) => {
                setGalleryUrl(event.target.value)
                setGalleryUrlError(undefined)
              }}
              onKeyDown={(event) => {
                // Enter adds the photo instead of submitting the whole form.
                if (event.key !== 'Enter') return
                event.preventDefault()
                addGalleryUrl()
              }}
            />
            <Button variant="secondary" onClick={addGalleryUrl}>
              Нэмэх
            </Button>
          </div>
        </div>
        {galleryUpload.error && (
          <Notice tone="error">
            Зураг оруулж чадсангүй: {galleryUpload.error}
            <br />
            Firebase Storage идэвхжээгүй бол зургийн холбоосыг дээрх талбарт буулгаж болно.
          </Notice>
        )}
      </div>
    </Card>
  )
}

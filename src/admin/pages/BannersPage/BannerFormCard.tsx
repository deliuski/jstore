import { useRef, useState, type FormEvent } from 'react'
import { CATEGORY_LABELS } from '../../../models/product'
import type { Banner } from '../../../models/settings'
import { uploadProductImage } from '../../../services/products'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Select } from '../../components/Form/Select'
import { TextField } from '../../components/Form/TextField'
import { useToast } from '../../components/Toast/toast'
import { errorMessage } from '../ProductFormPage/productForm'
import s from './BannersPage.module.css'

interface BannerFormCardProps {
  initial: Omit<Banner, 'id'>
  /** `true` while the banner doesn't exist yet. */
  saving: boolean
  products: Pick<BannerProduct, 'id' | 'name' | 'brand' | 'category'>[]
  onCancel: () => void
  onSave: (values: Omit<Banner, 'id'>) => Promise<void>
}

interface BannerProduct {
  id: string
  name: string
  brand: string
  category: keyof typeof CATEGORY_LABELS
}

/** One banner's editor: kicker, title, ghost word, photo and the linked product. */
export function BannerFormCard({ initial, saving, products, onCancel, onSave }: BannerFormCardProps) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const update = (patch: Partial<Banner>) => setDraft((current) => ({ ...current, ...patch }))

  const pickImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      update({ image: url })
    } catch (error) {
      toast(`Зураг оруулж чадсангүй: ${errorMessage(error)}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || uploading) return
    setBusy(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        ghost: draft.ghost.trim(),
        image: draft.image.trim(),
      })
    } finally {
      setBusy(false)
    }
  }

  const busyUploading = busy || uploading

  return (
    <Card title={saving ? 'Шинэ баннер' : 'Баннер засах'}>
      <form className={s.form} onSubmit={submit} noValidate>
        <div className={s.imageRow}>
          <div className={s.preview}>
            {draft.image ? (
              <img className={s.image} src={draft.image} alt="Баннерын зураг" />
            ) : (
              <span className={s.ghost}>{draft.ghost || 'ANZO'}</span>
            )}
          </div>
          <div className={s.imageActions}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              busy={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {draft.image ? 'Зураг солих' : 'Зураг оруулах'}
            </Button>
            {draft.image && (
              <Button type="button" variant="ghost" size="sm" onClick={() => update({ image: '' })}>
                Хасах
              </Button>
            )}
            <p className={s.imageHint}>Хоосон бол холбосон барааны зураг ашиглагдана.</p>
          </div>
        </div>

        <div className={s.grid}>
          <Select
            label="Дээд бичиг"
            value={draft.kicker}
            onChange={(event) => update({ kicker: event.target.value })}
          >
            <option value="ШИНЭ ИРСЭН">ШИНЭ ИРСЭН</option>
            <option value="ОНЦЛОХ">ОНЦЛОХ</option>
          </Select>
          <TextField
            label="Гарчиг"
            value={draft.title}
            placeholder="Барааны нэр ашиглах бол хоосон орхино"
            onChange={(event) => update({ title: event.target.value })}
          />
          <TextField
            label="Дэвсгэрийн үг"
            value={draft.ghost}
            placeholder="AJ9"
            hint="Пүүзний ард томоор гарч буй бичиг"
            maxLength={12}
            onChange={(event) => update({ ghost: event.target.value })}
          />
          <Select
            label="Ямар бараа унзуулах"
            value={draft.productId}
            onChange={(event) => update({ productId: event.target.value })}
            hint="«ХУДАЛДАЖ АВАХ» товч энэ барааны хуудас руу орочихно"
          >
            <option value="">Бүх бараа руу (каталог)</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {product.brand} · {CATEGORY_LABELS[product.category]}
              </option>
            ))}
          </Select>
        </div>

        <div className={s.formActions}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Болих
          </Button>
          <Button type="submit" busy={busyUploading} disabled={busyUploading}>
            Хадгалах
          </Button>
        </div>
      </form>
    </Card>
  )
}

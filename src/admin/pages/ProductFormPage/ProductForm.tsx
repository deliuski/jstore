import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router'
import { CATEGORY_LABELS, STATUS_LABELS, isCategory, type Product } from '../../../models/product'
import { deleteProduct, saveProduct } from '../../../services/products'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { NumberField } from '../../components/Form/NumberField'
import { Select } from '../../components/Form/Select'
import { TextArea } from '../../components/Form/TextArea'
import { TextField } from '../../components/Form/TextField'
import { Toggle } from '../../components/Form/Toggle'
import { Notice } from '../../components/Notice/Notice'
import { Pill } from '../../components/Pill/Pill'
import { useToast } from '../../components/Toast/toast'
import { adminTitle } from '../../components/title'
import { TrashIcon } from '../ProductsPage/icons'
import { CATEGORIES, STATUSES, toStatusFilter } from '../ProductsPage/productFilters'
import { useImageUpload, useLeaveWarning } from './formHooks'
import { ImagesSection } from './ImagesSection'
import {
  CATEGORY_PRESET,
  STATUS_HINTS,
  draftFromProduct,
  draftToInput,
  errorMessage,
  hasErrors,
  hasStockEntered,
  markFromName,
  newProductDraft,
  presetRows,
  validateDraft,
  type DraftErrors,
  type DraftUpdate,
} from './productForm'
import { SizesSection } from './SizesSection'
import s from './ProductForm.module.css'

const LIST_PATH = '/admin/products'
const NO_ERRORS: DraftErrors = { fields: {}, sizes: {} }
const STATUS_OPTIONS = STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))

interface ProductFormProps {
  /** `null` for a new product. */
  id: string | null
  /** The product being edited (a snapshot — later realtime changes are not merged in). */
  product?: Product
}

export function ProductForm({ id, product }: ProductFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState(() => (product ? draftFromProduct(product) : newProductDraft()))
  const [savedSnapshot] = useState(() => JSON.stringify(draft))
  // Errors show after the first save attempt, then follow every edit.
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialog, setDialog] = useState<'delete' | 'leave' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const mainUpload = useImageUpload()
  const galleryUpload = useImageUpload()

  const errors = validateDraft(draft)
  const shown = submitted ? errors : NO_ERRORS
  const dirty = JSON.stringify(draft) !== savedSnapshot
  const uploading = mainUpload.busy || galleryUpload.busy
  const productName = product?.name || 'Нэргүй бараа'
  useLeaveWarning(dirty)

  const update: DraftUpdate = (change) =>
    setDraft((current) => ({ ...current, ...(typeof change === 'function' ? change(current) : change) }))

  const changeCategory = (value: string) => {
    if (!isCategory(value)) return
    update((current) =>
      // A new product takes the category's usual size run until stock is entered.
      id === null && !hasStockEntered(current)
        ? { category: value, sizes: presetRows(CATEGORY_PRESET[value], current.sizes) }
        : { category: value },
    )
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving || uploading) return
    if (!draft.category || hasErrors(errors)) {
      flushSync(() => setSubmitted(true))
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSaving(true)
    try {
      await saveProduct(id, draftToInput({ ...draft, category: draft.category }))
      toast(id ? 'Өөрчлөлт хадгалагдлаа' : 'Шинэ бараа нэмэгдлээ')
      navigate(LIST_PATH)
    } catch (error) {
      toast(`Хадгалж чадсангүй: ${errorMessage(error)}`, 'error')
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProduct(id)
      toast(`«${productName}» устгагдлаа`)
      navigate(LIST_PATH)
    } catch (error) {
      toast(`Устгаж чадсангүй: ${errorMessage(error)}`, 'error')
      setDeleting(false)
      setDialog(null)
    }
  }

  const leave = () => (dirty ? setDialog('leave') : navigate(LIST_PATH))

  const saveButtons = (
    <>
      <Button variant="secondary" onClick={leave}>
        Болих
      </Button>
      <Button type="submit" form={formId} busy={saving} disabled={uploading}>
        Хадгалах
      </Button>
    </>
  )

  return (
    <>
      <title>{adminTitle(id ? productName : 'Шинэ бараа')}</title>
      <AdminPageHeader
        back={{ to: LIST_PATH, label: 'Бараа' }}
        title={id ? 'Бараа засах' : 'Шинэ бараа'}
        subtitle={product?.name}
        meta={dirty && <Pill tone="orange">Хадгалаагүй</Pill>}
        actions={
          <>
            {id && (
              <Button variant="danger" icon={<TrashIcon size={16} />} onClick={() => setDialog('delete')}>
                Устгах
              </Button>
            )}
            {saveButtons}
          </>
        }
      />

      <form id={formId} ref={formRef} onSubmit={save} noValidate>
        {submitted && hasErrors(errors) && (
          <Notice tone="error" className={s.notice}>
            Зарим талбарыг засах шаардлагатай — улаанаар тэмдэглэсэн хэсгийг шалгана уу.
          </Notice>
        )}

        <div className={s.layout}>
          <div className={s.column}>
            <Card title="Үндсэн мэдээлэл" className={s.basics}>
              <div className={s.grid}>
                <TextField
                  className={s.wide}
                  label="Нэр"
                  required
                  value={draft.name}
                  placeholder="Air Jordan 9 Retro"
                  error={shown.fields.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
                <TextField
                  label="Брэнд"
                  value={draft.brand}
                  placeholder="Jordan"
                  onChange={(event) => update({ brand: event.target.value })}
                />
                <Select
                  label="Ангилал"
                  required
                  value={draft.category}
                  error={shown.fields.category}
                  onChange={(event) => changeCategory(event.target.value)}
                >
                  <option value="" disabled>
                    Сонгоно уу
                  </option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
                <TextField
                  label="SKU"
                  value={draft.sku}
                  placeholder="AJ9-SPACE-JAM"
                  hint="Барааны дотоод код"
                  spellCheck={false}
                  onChange={(event) => update({ sku: event.target.value })}
                />
                <TextArea
                  className={s.wide}
                  label="Тайлбар"
                  value={draft.description}
                  rows={5}
                  placeholder="Материал, өнгө, онцлог…"
                  onChange={(event) => update({ description: event.target.value })}
                />
              </div>
            </Card>

            <ImagesSection
              className={s.images}
              draft={draft}
              onChange={update}
              imageError={shown.fields.image}
              mainUpload={mainUpload}
              galleryUpload={galleryUpload}
            />

            <SizesSection className={s.sizes} draft={draft} onChange={update} errors={shown} />
          </div>

          <div className={s.column}>
            <Card title="Үнэ" className={s.price}>
              <div className={s.stack}>
                <NumberField
                  label="Үнэ"
                  suffix="₮"
                  value={draft.price}
                  min={0}
                  hint="Хоосон бол дэлгүүрт «[Үнэ] ₮» гэж харагдана"
                  error={shown.fields.price}
                  onChange={(price) => update({ price })}
                />
                <Toggle
                  label="Хямдралтай"
                  hint="«Хямдрал» тэмдэг, зурсан хуучин үнэтэй харагдана"
                  checked={draft.onSale}
                  onChange={(onSale) => update({ onSale })}
                />
                {draft.onSale && (
                  <NumberField
                    label="Хуучин үнэ"
                    suffix="₮"
                    value={draft.oldPrice}
                    min={0}
                    hint="Хямдралаас өмнөх үнэ"
                    error={shown.fields.oldPrice}
                    onChange={(oldPrice) => update({ oldPrice })}
                  />
                )}
              </div>
            </Card>

            <Card title="Харагдах байдал" className={s.visibility}>
              <div className={s.stack}>
                <Select
                  label="Төлөв"
                  value={draft.status}
                  options={STATUS_OPTIONS}
                  hint={STATUS_HINTS[draft.status]}
                  onChange={(event) => {
                    const status = toStatusFilter(event.target.value)
                    if (status !== 'all') update({ status })
                  }}
                />
                <Toggle
                  label="Шинэ"
                  hint="«Шинэ» тэмдэгтэй харагдана"
                  checked={draft.isNew}
                  onChange={(isNew) => update({ isNew })}
                />
                <Toggle
                  label="Нүүр хуудсанд харуулах"
                  hint="Нүүр хуудасны «Шинэ ирсэн» хэсэгт гарна"
                  checked={draft.featured}
                  onChange={(featured) => update({ featured })}
                />
                <NumberField
                  label="Эрэмбэ"
                  value={draft.sortOrder}
                  min={0}
                  hint="Бага тоотой нь жагсаалтад эхэлж харагдана"
                  error={shown.fields.sortOrder}
                  onChange={(sortOrder) => update({ sortOrder })}
                />
                <TextField
                  label="Зураггүй үеийн тэмдэг"
                  value={draft.mark}
                  placeholder={markFromName(draft.name) || 'AJ9'}
                  maxLength={6}
                  hint="Зураг ороогүй үед дэвсгэр дээр бичигдэнэ. Хоосон бол нэрнээс авна."
                  onChange={(event) => update({ mark: event.target.value })}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className={s.footer}>{saveButtons}</div>
      </form>

      <ConfirmDialog
        open={dialog === 'delete'}
        title="Бараа устгах уу?"
        message={`«${productName}» бараа бүх размер, нөөцийн хамт бүр мөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.`}
        confirmLabel="Устгах"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'leave'}
        title="Өөрчлөлтийг хадгалахгүй юу?"
        message="Хадгалаагүй өөрчлөлтүүд устана."
        confirmLabel="Хадгалахгүй гарах"
        cancelLabel="Засварлах"
        onConfirm={() => navigate(LIST_PATH)}
        onCancel={() => setDialog(null)}
      />
    </>
  )
}

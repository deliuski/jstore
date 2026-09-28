import {
  BOOT_SIZES,
  SNEAKER_SIZES,
  emptyProduct,
  type Category,
  type Product,
  type ProductStatus,
} from '../../../models/product'
import type { ProductInput } from '../../../services/products'

export interface SizeRow {
  /** Stable React key — labels are editable and may repeat while typing. */
  key: number
  label: string
  stock: number | null
}

/** The form state. Numbers are `null` while their input is empty. */
export interface ProductDraft {
  name: string
  brand: string
  /** '' until chosen (new products). */
  category: Category | ''
  sku: string
  description: string
  price: number | null
  oldPrice: number | null
  onSale: boolean
  /** '' = no photo. */
  image: string
  imageFit: Product['imageFit']
  gallery: string[]
  /** Empty = one-size item, counted with `stock`. */
  sizes: SizeRow[]
  stock: number | null
  status: ProductStatus
  isNew: boolean
  featured: boolean
  sortOrder: number | null
  /** '' = derived from the name on save. */
  mark: string
}

export type ValidDraft = Omit<ProductDraft, 'category'> & { category: Category }

/** Merges a change into the draft; pass a function to build it from the latest state (e.g. after an upload). */
export type DraftUpdate = (change: Partial<ProductDraft> | ((draft: ProductDraft) => Partial<ProductDraft>)) => void

export const STATUS_HINTS: Record<ProductStatus, string> = {
  active: 'Дэлгүүрт харагдаж, захиалга авна',
  soon: 'Дэлгүүрт «Удахгүй ирнэ» гэж харагдаж, урьдчилсан захиалга авна',
  draft: 'Зөвхөн удирдлагад харагдана',
  hidden: 'Дэлгүүрээс нуусан — зөвхөн удирдлагад харагдана',
}

export const IMAGE_FIT_OPTIONS: { value: Product['imageFit']; label: string }[] = [
  { value: 'contain', label: 'Цагаан дэвсгэр (contain)' },
  { value: 'cover', label: 'Бүтэн зураг (cover)' },
]

let lastRowKey = 0

export function sizeRow(label = '', stock: number | null = 0): SizeRow {
  lastRowKey += 1
  return { key: lastRowKey, label, stock }
}

export function draftFromProduct(product: ProductInput): ProductDraft {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    sku: product.sku,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    onSale: product.onSale,
    image: product.image ?? '',
    imageFit: product.imageFit,
    gallery: product.gallery,
    sizes: product.sizes.map((size) => sizeRow(size.label, size.stock)),
    stock: product.stock,
    status: product.status,
    isNew: product.isNew,
    featured: product.featured,
    sortOrder: product.sortOrder,
    mark: product.mark,
  }
}

/** A blank product; the category is left for the owner to pick. */
export function newProductDraft(): ProductDraft {
  return { ...draftFromProduct(emptyProduct()), category: '' }
}

/** "Air Jordan 9 Retro" → "AJ9", "Өвлийн гутал" → "ӨВЛИ" — the text on the photo placeholder. */
export function markFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const numberAt = words.findIndex((word) => /^\d/.test(word))
  const mark =
    numberAt < 0
      ? (words[0] ?? '').slice(0, 4)
      : words
          .slice(0, numberAt)
          .map((word) => word[0])
          .join('') + parseInt(words[numberAt], 10)
  return mark.slice(0, 5).toUpperCase()
}

export function draftToInput(draft: ValidDraft): ProductInput {
  return {
    name: draft.name.trim(),
    brand: draft.brand.trim(),
    category: draft.category,
    description: draft.description.trim(),
    price: draft.price,
    oldPrice: draft.oldPrice,
    onSale: draft.onSale,
    sku: draft.sku.trim(),
    image: draft.image.trim() || null,
    imageFit: draft.imageFit,
    gallery: draft.gallery,
    mark: draft.mark.trim() || markFromName(draft.name),
    sizes: draft.sizes.map((row) => ({ label: row.label.trim(), stock: row.stock ?? 0 })),
    stock: draft.stock ?? 0,
    isNew: draft.isNew,
    featured: draft.featured,
    status: draft.status,
    sortOrder: draft.sortOrder ?? 100,
  }
}

/* ---------- Sizes ---------- */

export type SizePreset = 'sneaker' | 'boot' | 'none'

export const SIZE_PRESETS: { value: SizePreset; label: string; sizes: string[] }[] = [
  { value: 'sneaker', label: 'Пүүз 40–47', sizes: SNEAKER_SIZES },
  { value: 'boot', label: 'Өвлийн гутал 36–45', sizes: BOOT_SIZES },
  { value: 'none', label: 'Размергүй', sizes: [] },
]

/** The preset a category usually needs (bags are one-size). */
export const CATEGORY_PRESET: Record<Category, SizePreset> = {
  sneaker: 'sneaker',
  boot: 'boot',
  bag: 'none',
}

/** The preset the rows currently match, or 'custom'. */
export function currentPreset(sizes: SizeRow[]): SizePreset | 'custom' {
  const labels = sizes.map((row) => row.label.trim()).join('|')
  return SIZE_PRESETS.find((preset) => preset.sizes.join('|') === labels)?.value ?? 'custom'
}

/** Rows for a preset, keeping the stock already entered for the same sizes. */
export function presetRows(preset: SizePreset, current: SizeRow[]): SizeRow[] {
  const labels = SIZE_PRESETS.find((option) => option.value === preset)?.sizes ?? []
  return labels.map((label) => current.find((row) => row.label.trim() === label) ?? sizeRow(label))
}

export function hasStockEntered(draft: ProductDraft): boolean {
  return (draft.stock ?? 0) > 0 || draft.sizes.some((row) => (row.stock ?? 0) > 0)
}

export function draftTotal(draft: ProductDraft): number {
  return draft.sizes.length > 0
    ? draft.sizes.reduce((sum, row) => sum + Math.max(0, row.stock ?? 0), 0)
    : Math.max(0, draft.stock ?? 0)
}

/* ---------- Images ---------- */

/** An uploaded/remote photo (http…) or a file of the site (/images/…). */
export function isImageSource(value: string): boolean {
  return /^(https?:\/\/|\/)\S+$/i.test(value.trim())
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/* ---------- Validation ---------- */

type Field = 'name' | 'category' | 'price' | 'oldPrice' | 'image' | 'stock' | 'sortOrder'

export interface DraftErrors {
  fields: Partial<Record<Field, string>>
  /** By `SizeRow.key`. */
  sizes: Record<number, { label?: string; stock?: string }>
}

function amountError(value: number | null): string | undefined {
  if (value === null) return undefined
  if (value < 0) return '0 буюу түүнээс их тоо оруулна уу'
  if (!Number.isInteger(value)) return 'Бүхэл тоо оруулна уу'
  return undefined
}

export function validateDraft(draft: ProductDraft): DraftErrors {
  const fields: DraftErrors['fields'] = {
    name: draft.name.trim() ? undefined : 'Барааны нэрийг оруулна уу',
    category: draft.category ? undefined : 'Ангилал сонгоно уу',
    price: amountError(draft.price),
    oldPrice: amountError(draft.oldPrice),
    image: !draft.image.trim() || isImageSource(draft.image) ? undefined : 'https://… холбоос эсвэл /images/… зам оруулна уу',
    stock: draft.sizes.length === 0 ? amountError(draft.stock) : undefined,
    sortOrder: amountError(draft.sortOrder),
  }
  if (
    !fields.oldPrice &&
    draft.onSale &&
    draft.oldPrice !== null &&
    draft.price !== null &&
    draft.oldPrice <= draft.price
  ) {
    fields.oldPrice = 'Хуучин үнэ одоогийн үнээс их байх ёстой'
  }

  const sizes: DraftErrors['sizes'] = {}
  const seen = new Set<string>()
  for (const row of draft.sizes) {
    const label = row.label.trim().toLowerCase()
    const labelError = !label ? 'Размер оруулна уу' : seen.has(label) ? 'Давхардсан размер' : undefined
    const stockError = amountError(row.stock)
    seen.add(label)
    if (labelError || stockError) sizes[row.key] = { label: labelError, stock: stockError }
  }
  return { fields, sizes }
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.values(errors.fields).some(Boolean) || Object.keys(errors.sizes).length > 0
}

/** The message of a thrown error (Firebase errors carry a readable one). */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

import { useMemo, useState } from 'react'
import { CheckIcon } from '../../../components/icons'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAllProducts } from '../../../hooks/data'
import { CATEGORY_LABELS, hasSizes, type Product } from '../../../models/product'
import { setStock } from '../../../services/products'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { NumberField } from '../../components/Form/NumberField'
import { SearchField } from '../../components/SearchField/SearchField'
import { ProductThumb } from '../../components/ProductThumb/ProductThumb'
import { useToast } from '../../components/Toast/toast'
import { adminTitle } from '../../components/title'
import { errorMessage } from '../ProductFormPage/productForm'
import s from './InventoryPage.module.css'

type CategoryFilter = 'all' | 'sneaker' | 'boot' | 'bag'

const CATEGORIES: CategoryFilter[] = ['all', 'sneaker', 'boot', 'bag']

export function InventoryPage() {
  const products = useAllProducts(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const all = products.data ?? []
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((product) => {
      if (category !== 'all' && product.category !== category) return false
      if (!q) return true
      return (
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q)
      )
    })
  }, [all, query, category])

  const lowCount = all.filter((product) => product.status === 'active' && totalStock(product) <= LOW_STOCK).length

  return (
    <>
      <title>{adminTitle('Нөөц · размер')}</title>
      <AdminPageHeader
        title="Нөөц · размер"
        subtitle={products.data && `${results.length} / ${all.length} бараа · ${lowCount} дуусаж буй`}
      />

      {products.error ? (
        <PageError />
      ) : products.loading ? (
        <PageLoader />
      ) : all.length === 0 ? (
        <Card>
          <EmptyState title="Бараа алга" text="Бараа нэмсний дараа энд нөөц тавина уу." />
        </Card>
      ) : (
        <div className={s.stack}>
          <Card>
            <div className={s.toolbar}>
              <SearchField value={query} onChange={setQuery} placeholder="Нэр, брэнд, SKU хайх" label="Бараа хайх" />
              <div className={s.chips} role="group" aria-label="Ангиллаар шүүх">
                {CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={s.chip}
                    aria-pressed={value === category}
                    onClick={() => setCategory(value)}
                  >
                    {value === 'all' ? 'Бүгд' : CATEGORY_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {results.length === 0 ? (
            <Card>
              <EmptyState title="Тохирох бараа олдсонгүй" text="Хайлтаа өөрчлөөд дахин үзнэ үү." />
            </Card>
          ) : (
            results.map((product) => <ProductStockRow key={product.id} product={product} />)
          )}
        </div>
      )}
    </>
  )
}

/** Products whose total stock is at or below this show up in the "дуусаж буй" count. */
const LOW_STOCK = 2

function totalStock(product: Product): number {
  return hasSizes(product) ? product.sizes.reduce((sum, size) => sum + size.stock, 0) : product.stock
}

interface Draft {
  sizes: { label: string; stock: number }[]
  stock: number
}

/** One product: photo, name, and a grid of per-size stock fields with a save button. */
function ProductStockRow({ product }: { product: Product }) {
  const toast = useToast()
  const [draft, setDraft] = useState<Draft>(() => toDraft(product))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty = useMemo(() => !equals(draft, toDraft(product)), [draft, product])
  const oneSize = !hasSizes(product)

  const setSizeStock = (label: string, value: number | null) => {
    setDraft((current) => ({
      ...current,
      sizes: current.sizes.map((size) => (size.label === label ? { ...size, stock: value ?? 0 } : size)),
    }))
    setSaved(false)
  }

  const setOneSizeStock = (value: number | null) => {
    setDraft((current) => ({ ...current, stock: value ?? 0 }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await setStock(product.id, draft.sizes, draft.stock)
      toast(`«${product.name}» нөөц хадгалагдлаа`)
      setSaved(true)
    } catch (error) {
      toast(`Хадгалж чадсангүй: ${errorMessage(error)}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={s.row}>
      <div className={s.product}>
        <ProductThumb item={product} size={44} />
        <div className={s.info}>
          <p className={s.name} title={product.name}>
            {product.name}
          </p>
          <p className={s.meta}>
            {product.brand} · {CATEGORY_LABELS[product.category]} · Нийт {totalStockValue(product, draft)} ш
          </p>
        </div>
        {dirty ? (
          <Button size="sm" onClick={save} busy={saving} disabled={saving}>
            Хадгалах
          </Button>
        ) : (
          saved && (
            <span className={s.saved} role="status">
              <CheckIcon size={16} strokeWidth={2.4} />
              Хадгалсан
            </span>
          )
        )}
      </div>

      {oneSize ? (
        <div className={s.sizes}>
          <div className={s.sizeCell}>
            <span className={s.sizeLabel} aria-hidden="true">
              Нөөц
            </span>
            <NumberField
              label="Нөөц (ширхэг)"
              hideLabel
              value={draft.stock}
              min={0}
              step={1}
              stepper
              onChange={setOneSizeStock}
              aria-label={`${product.name}: нөөц`}
            />
          </div>
        </div>
      ) : (
        <div className={s.sizes}>
          {draft.sizes.map((size) => (
            <div key={size.label} className={s.sizeCell}>
              <span className={s.sizeLabel} aria-hidden="true">
                EU {size.label}
              </span>
              <NumberField
                label={`EU ${size.label}`}
                hideLabel
                value={size.stock}
                min={0}
                step={1}
                stepper
                onChange={(value) => setSizeStock(size.label, value)}
                aria-label={`${product.name}: EU ${size.label} нөөц`}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const toDraft = (product: Product): Draft => ({ sizes: product.sizes.map((s) => ({ ...s })), stock: product.stock })

function equals(a: Draft, b: Draft): boolean {
  return a.stock === b.stock && a.sizes.every((size, i) => size.stock === b.sizes[i]?.stock && size.label === b.sizes[i]?.label)
}

function totalStockValue(product: Product, draft: Draft): number {
  return hasSizes(product) ? draft.sizes.reduce((sum, size) => sum + size.stock, 0) : draft.stock
}

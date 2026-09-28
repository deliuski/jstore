import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { PlusIcon } from '../../../components/icons'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAllProducts } from '../../../hooks/data'
import { CATEGORY_LABELS, STATUS_LABELS, type Product } from '../../../models/product'
import { deleteProduct } from '../../../services/products'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Button } from '../../components/Button/Button'
import { ButtonLink } from '../../components/Button/ButtonLink'
import { Card } from '../../components/Card/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FilterChips, type ChipOption } from '../../components/FilterChips/FilterChips'
import { Select } from '../../components/Form/Select'
import { SearchField } from '../../components/SearchField/SearchField'
import { useToast } from '../../components/Toast/toast'
import { adminTitle } from '../../components/title'
import { errorMessage } from '../ProductFormPage/productForm'
import {
  CATEGORIES,
  STATUSES,
  filterProducts,
  parseFilters,
  serializeFilters,
  toStatusFilter,
  useUrlDraft,
  type ProductFilters,
} from './productFilters'
import { ProductsTable } from './ProductsTable'
import s from './ProductsPage.module.css'

export function ProductsPage() {
  const products = useAllProducts(true)
  const toast = useToast()
  // Filters live in the URL, so links, reloads and the back button keep them.
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const [query, setQuery] = useUrlDraft(filters.query)
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const all = products.data ?? []
  const results = filterProducts(all, filters)
  const filtered = filters.query.trim() !== '' || filters.category !== 'all' || filters.status !== 'all'

  const setFilters = (patch: Partial<ProductFilters>, replace = false) =>
    setSearchParams(serializeFilters({ ...filters, ...patch }), { replace })

  const search = (value: string) => {
    setQuery(value)
    setFilters({ query: value }, true)
  }

  const clearFilters = () => {
    setQuery('')
    setSearchParams({})
  }

  // Each count follows the other active filters, so it matches what the chip would show.
  const categoryOptions: ChipOption<ProductFilters['category']>[] = [
    { value: 'all', label: 'Бүгд', count: filterProducts(all, { ...filters, category: 'all' }).length },
    ...CATEGORIES.map((category) => ({
      value: category,
      label: CATEGORY_LABELS[category],
      count: filterProducts(all, { ...filters, category }).length,
    })),
  ]

  const statusOptions = [
    { value: 'all', label: 'Бүх төлөв' },
    ...STATUSES.map((status) => ({
      value: status,
      label: `${STATUS_LABELS[status]} (${filterProducts(all, { ...filters, status }).length})`,
    })),
  ]

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id)
      toast(`«${toDelete.name || 'Нэргүй бараа'}» устгагдлаа`)
      setToDelete(null)
    } catch (error) {
      toast(`Устгаж чадсангүй: ${errorMessage(error)}`, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <title>{adminTitle('Бараа')}</title>
      <AdminPageHeader
        title="Бараа"
        subtitle={products.data && (filtered ? `${results.length} / ${all.length} бараа` : `${all.length} бараа`)}
        actions={
          <ButtonLink to="/admin/products/new" className={s.add} icon={<PlusIcon size={20} strokeWidth={2} />}>
            Бараа нэмэх
          </ButtonLink>
        }
      />

      {products.error ? (
        <PageError />
      ) : products.loading ? (
        <PageLoader />
      ) : (
        <Card>
          <div className={s.toolbar}>
            <SearchField
              className={s.search}
              value={query}
              onChange={search}
              placeholder="Нэр, брэнд, SKU хайх"
              label="Бараа хайх"
            />
            <FilterChips
              options={categoryOptions}
              value={filters.category}
              onChange={(category) => setFilters({ category })}
              label="Ангиллаар шүүх"
            />
            <Select
              className={s.status}
              label="Төлөвөөр шүүх"
              hideLabel
              value={filters.status}
              options={statusOptions}
              onChange={(event) => setFilters({ status: toStatusFilter(event.target.value) })}
            />
          </div>

          {all.length === 0 ? (
            <EmptyState
              title="Бараа алга"
              text="Эхний бараагаа нэмнэ үү. Эсвэл Тохиргоо → «Анхны тохиргоо»-оор жишээ бараануудыг оруулж болно."
              action={
                <ButtonLink to="/admin/products/new" icon={<PlusIcon size={20} strokeWidth={2} />}>
                  Бараа нэмэх
                </ButtonLink>
              }
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="Тохирох бараа олдсонгүй"
              text="Хайлт эсвэл шүүлтүүрээ өөрчлөөд дахин үзнэ үү."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Шүүлтүүр цэвэрлэх
                </Button>
              }
            />
          ) : (
            <ProductsTable products={results} onDelete={setToDelete} />
          )}
        </Card>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Бараа устгах уу?"
        message={
          toDelete && (
            <>
              «{toDelete.name || 'Нэргүй бараа'}» бараа бүх размер, нөөцийн хамт бүр мөсөн устгагдана. Энэ үйлдлийг
              буцаах боломжгүй.
            </>
          )
        }
        confirmLabel="Устгах"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}

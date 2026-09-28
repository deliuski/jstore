import { formatPrice } from '../../lib/format'
import {
  CATEGORY_LABELS,
  availableSizes,
  isOnSale,
  isSoldOut,
  sortProducts,
  type Category,
  type Product,
} from '../../models/product'

/** The "Онцлох" group. In the URL: `tag=new,sale` and `status=soon`. */
export type Highlight = 'new' | 'sale' | 'soon'

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'name'

export interface CatalogFilters {
  categories: Category[]
  sizes: string[]
  highlights: Highlight[]
  inStock: boolean
  minPrice: number | null
  maxPrice: number | null
  /** Raw search text, as typed. */
  query: string
  sort: SortKey
}

/** Applies a change to the URL; `replace` is used while typing. */
export type FilterChange = (patch: Partial<CatalogFilters>, options?: { replace?: boolean }) => void

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export const HIGHLIGHTS: Highlight[] = ['new', 'sale', 'soon']

export const HIGHLIGHT_LABELS: Record<Highlight, string> = {
  new: 'Шинэ',
  sale: 'Хямдрал',
  soon: 'Удахгүй ирнэ',
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Санал болгох' },
  { value: 'price-asc', label: 'Үнэ: өсөхөөр' },
  { value: 'price-desc', label: 'Үнэ: буурахаар' },
  { value: 'name', label: 'Нэрээр' },
]

export const NO_FILTERS: CatalogFilters = {
  categories: [],
  sizes: [],
  highlights: [],
  inStock: false,
  minPrice: null,
  maxPrice: null,
  query: '',
  sort: 'recommended',
}

/* ---------- URL <-> filters ---------- */

function parseList(value: string | null): string[] {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []
}

function parsePrice(value: string | null): number | null {
  return value && /^\d+$/.test(value) ? Number(value) : null
}

export function toSortKey(value: string | null): SortKey {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? 'recommended'
}

export function sortSizes(sizes: string[]): string[] {
  return [...new Set(sizes)].sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b))
}

/** Tolerant of hand-typed URLs: unknown values are ignored. */
export function parseFilters(params: URLSearchParams): CatalogFilters {
  const categories = parseList(params.get('cat'))
  const tags = parseList(params.get('tag'))
  const soon = parseList(params.get('status')).includes('soon')
  return {
    categories: CATEGORIES.filter((category) => categories.includes(category)),
    sizes: sortSizes(parseList(params.get('size'))),
    highlights: HIGHLIGHTS.filter((highlight) => (highlight === 'soon' ? soon : tags.includes(highlight))),
    inStock: params.get('instock') === '1',
    minPrice: parsePrice(params.get('min')),
    maxPrice: parsePrice(params.get('max')),
    query: params.get('q') ?? '',
    sort: toSortKey(params.get('sort')),
  }
}

/** "?cat=sneaker,boot&size=42" — defaults are left out, lists keep a stable order. */
export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams()
  const categories = CATEGORIES.filter((category) => filters.categories.includes(category))
  const tags = HIGHLIGHTS.filter((highlight) => highlight !== 'soon' && filters.highlights.includes(highlight))

  if (filters.query.trim()) params.set('q', filters.query)
  if (categories.length > 0) params.set('cat', categories.join(','))
  if (filters.sizes.length > 0) params.set('size', sortSizes(filters.sizes).join(','))
  if (tags.length > 0) params.set('tag', tags.join(','))
  if (filters.highlights.includes('soon')) params.set('status', 'soon')
  if (filters.inStock) params.set('instock', '1')
  if (filters.minPrice !== null) params.set('min', String(filters.minPrice))
  if (filters.maxPrice !== null) params.set('max', String(filters.maxPrice))
  if (filters.sort !== 'recommended') params.set('sort', filters.sort)

  // Commas are valid in a query string; keeping them readable makes links shareable.
  const search = params.toString().replaceAll('%2C', ',')
  return search ? `?${search}` : ''
}

/* ---------- Matching ---------- */

/** Can be bought right now (not sold out, not a pre-order). */
export function isInStock(product: Product): boolean {
  return product.status === 'active' && !isSoldOut(product)
}

/** Sizes a customer can get: pre-orders take any size of the run. */
function orderableSizes(product: Product): string[] {
  return product.status === 'soon' ? product.sizes.map((size) => size.label) : availableSizes(product)
}

function hasHighlight(product: Product, highlight: Highlight): boolean {
  if (highlight === 'new') return product.isNew
  if (highlight === 'sale') return isOnSale(product)
  return product.status === 'soon'
}

/** Products without a price only drop out once a price bound is set. */
function withinPrice(product: Product, min: number | null, max: number | null): boolean {
  if (min === null && max === null) return true
  if (product.price === null) return false
  return (min === null || product.price >= min) && (max === null || product.price <= max)
}

/** Every word must appear in the name, brand or SKU. */
function matchesQuery(product: Product, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const haystack = `${product.name} ${product.brand} ${product.sku}`.toLowerCase()
  return terms.every((term) => haystack.includes(term))
}

// Options within a group are OR-ed, groups are AND-ed.
function matchesFilters(product: Product, filters: CatalogFilters): boolean {
  const { categories, sizes, highlights } = filters
  if (categories.length > 0 && !categories.includes(product.category)) return false
  if (sizes.length > 0 && !orderableSizes(product).some((size) => sizes.includes(size))) return false
  if (highlights.length > 0 && !highlights.some((highlight) => hasHighlight(product, highlight))) return false
  if (filters.inStock && !isInStock(product)) return false
  if (!withinPrice(product, filters.minPrice, filters.maxPrice)) return false
  return matchesQuery(product, filters.query)
}

export function countMatches(products: Product[], filters: CatalogFilters): number {
  return products.filter((product) => matchesFilters(product, filters)).length
}

/** Price sorts keep products without a price at the end. */
function comparePrice(a: Product, b: Product, direction: 1 | -1): number {
  if (a.price === null || b.price === null) return Number(a.price === null) - Number(b.price === null)
  return (a.price - b.price) * direction
}

/** The filtered, sorted product list. */
export function applyFilters(products: Product[], filters: CatalogFilters): Product[] {
  // Sorting is stable, so ties keep the recommended (sortOrder) order.
  const matching = sortProducts(products.filter((product) => matchesFilters(product, filters)))
  switch (filters.sort) {
    case 'price-asc':
      return matching.sort((a, b) => comparePrice(a, b, 1))
    case 'price-desc':
      return matching.sort((a, b) => comparePrice(a, b, -1))
    case 'name':
      return matching.sort((a, b) => a.name.localeCompare(b.name, 'mn'))
    default:
      return matching
  }
}

/* ---------- Filter UI helpers ---------- */

/** Every size in the catalog, smallest first. */
export function catalogSizes(products: Product[]): string[] {
  return sortSizes(products.flatMap((product) => product.sizes.map((size) => size.label)))
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

/** Active sidebar filters — the number on the mobile "ШҮҮЛТҮҮР (n)" button. */
export function filterCount(filters: CatalogFilters): number {
  const { categories, sizes, highlights, inStock, minPrice, maxPrice } = filters
  return (
    categories.length +
    sizes.length +
    highlights.length +
    Number(inStock) +
    Number(minPrice !== null) +
    Number(maxPrice !== null)
  )
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return filterCount(filters) > 0 || filters.query.trim() !== ''
}

/** Everything cleared except the sort order. */
export function resetFilters(filters: CatalogFilters): CatalogFilters {
  return { ...NO_FILTERS, sort: filters.sort }
}

export interface FilterChip {
  key: string
  label: string
  /** The change that removes this filter. */
  remove: Partial<CatalogFilters>
}

export function activeChips(filters: CatalogFilters): FilterChip[] {
  const { categories, sizes, highlights, minPrice, maxPrice } = filters
  const query = filters.query.trim()
  const chips: FilterChip[] = []

  if (query) chips.push({ key: 'q', label: `Хайлт: ${query}`, remove: { query: '' } })
  for (const category of categories) {
    chips.push({
      key: `cat-${category}`,
      label: CATEGORY_LABELS[category],
      remove: { categories: toggleValue(categories, category) },
    })
  }
  for (const size of sizes) {
    chips.push({ key: `size-${size}`, label: `Размер ${size}`, remove: { sizes: toggleValue(sizes, size) } })
  }
  for (const highlight of highlights) {
    chips.push({
      key: `hl-${highlight}`,
      label: HIGHLIGHT_LABELS[highlight],
      remove: { highlights: toggleValue(highlights, highlight) },
    })
  }
  if (filters.inStock) chips.push({ key: 'instock', label: 'Бэлэн байгаа', remove: { inStock: false } })
  if (minPrice !== null) {
    chips.push({ key: 'min', label: `Доод үнэ: ${formatPrice(minPrice)}`, remove: { minPrice: null } })
  }
  if (maxPrice !== null) {
    chips.push({ key: 'max', label: `Дээд үнэ: ${formatPrice(maxPrice)}`, remove: { maxPrice: null } })
  }
  return chips
}

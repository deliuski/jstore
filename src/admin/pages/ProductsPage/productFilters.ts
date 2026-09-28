import { useState } from 'react'
import { NavigationType, useNavigationType } from 'react-router'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  isCategory,
  type Category,
  type Product,
  type ProductStatus,
} from '../../../models/product'

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]
export const STATUSES = Object.keys(STATUS_LABELS) as ProductStatus[]

export interface ProductFilters {
  /** Raw search text, as typed. */
  query: string
  category: Category | 'all'
  status: ProductStatus | 'all'
}

/** A status filter value from the URL or a select; anything unknown means "all". */
export function toStatusFilter(value: string | null): ProductFilters['status'] {
  return value !== null && Object.hasOwn(STATUS_LABELS, value) ? (value as ProductStatus) : 'all'
}

/** `?q=aj&cat=sneaker&status=draft` — unknown values are ignored. */
export function parseFilters(params: URLSearchParams): ProductFilters {
  const category = params.get('cat')
  return {
    query: params.get('q') ?? '',
    category: isCategory(category) ? category : 'all',
    status: toStatusFilter(params.get('status')),
  }
}

export function serializeFilters(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query)
  if (filters.category !== 'all') params.set('cat', filters.category)
  if (filters.status !== 'all') params.set('status', filters.status)
  return params
}

/** Case-insensitive match on the name, brand or SKU. */
export function matchesQuery(product: Product, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return true
  return [product.name, product.brand, product.sku].some((field) => field.toLocaleLowerCase().includes(needle))
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(
    (product) =>
      (filters.category === 'all' || product.category === filters.category) &&
      (filters.status === 'all' || product.status === filters.status) &&
      matchesQuery(product, filters.query),
  )
}

/**
 * Local text for a search box whose value lives in the URL. Router updates run in a
 * transition, which can't drive a controlled input, so the input keeps its own state.
 * Typing writes with replace navigation; any other URL change (sidebar link, back
 * button) is copied into the input.
 */
export function useUrlDraft(urlValue: string): [string, (value: string) => void] {
  const navigationType = useNavigationType()
  const [draft, setDraft] = useState(urlValue)
  const [seen, setSeen] = useState(urlValue)

  if (urlValue !== seen) {
    setSeen(urlValue)
    if (navigationType !== NavigationType.Replace) setDraft(urlValue)
  }
  return [draft, setDraft]
}

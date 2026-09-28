import { useParams } from 'react-router'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useAllProducts } from '../../../hooks/data'
import type { Product } from '../../../models/product'
import { ProductForm } from './ProductForm.tsx'

/**
 * «Бараа нэмэх» / «Бараа засах». `products/new` opens a blank form; `products/:id`
 * waits for the shared product list and opens the one being edited.
 */
export function ProductFormPage() {
  const { id } = useParams()
  const products = useAllProducts(true)

  if (products.loading) return <PageLoader />
  if (products.error) return <PageError />

  const product: Product | undefined = id === undefined ? undefined : products.data?.find((p) => p.id === id)
  if (id !== undefined && !product) {
    return <PageError message={`#${id} дугаартай бараа олдсонгүй. Устгагдсан эсвэл холбоос буруу байж магадгүй.`} />
  }

  // `key` remounts the form when the id changes, so no stale draft survives navigation.
  return <ProductForm key={id ?? 'new'} id={id ?? null} product={product} />
}

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import {
  isCategory,
  sortProducts,
  type Product,
  type ProductStatus,
  type SizeStock,
} from '../models/product'
import { toDate, toNumber, toNumberOrNull, toString, toStringArray } from './convert'

const productsCol = collection(db, 'products')
const STATUSES: ProductStatus[] = ['active', 'soon', 'draft', 'hidden']

/** Tolerant of missing/old fields, so hand-edited documents never crash the site. */
export function productFromDoc(id: string, data: DocumentData): Product {
  const sizes: SizeStock[] = Array.isArray(data.sizes)
    ? data.sizes
        .filter((size: unknown): size is { label: unknown; stock: unknown } => typeof size === 'object' && size !== null)
        .map((size) => ({ label: String(size.label), stock: Math.max(0, toNumber(size.stock)) }))
    : []
  return {
    id,
    name: toString(data.name),
    brand: toString(data.brand),
    category: isCategory(data.category) ? data.category : 'sneaker',
    description: toString(data.description),
    price: toNumberOrNull(data.price),
    oldPrice: toNumberOrNull(data.oldPrice),
    onSale: data.onSale === true,
    sku: toString(data.sku),
    image: typeof data.image === 'string' && data.image ? data.image : null,
    imageFit: data.imageFit === 'cover' ? 'cover' : 'contain',
    gallery: toStringArray(data.gallery),
    mark: toString(data.mark),
    sizes,
    stock: Math.max(0, toNumber(data.stock)),
    isNew: data.isNew === true,
    featured: data.featured === true,
    status: STATUSES.includes(data.status) ? data.status : 'draft',
    sortOrder: toNumber(data.sortOrder, 100),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

function productToDoc(product: ProductInput): DocumentData {
  const { name, brand, category, description, price, oldPrice, onSale, sku, image, imageFit, gallery, mark } = product
  const { sizes, stock, isNew, featured, status, sortOrder } = product
  return {
    name: name.trim(),
    brand: brand.trim(),
    category,
    description: description.trim(),
    price,
    oldPrice,
    onSale,
    sku: sku.trim(),
    image,
    imageFit,
    gallery,
    mark: mark.trim(),
    sizes: sizes.map((size) => ({ label: size.label.trim(), stock: Math.max(0, Math.floor(size.stock)) })),
    stock: Math.max(0, Math.floor(stock)),
    isNew,
    featured,
    status,
    sortOrder,
  }
}

/** Storefront: every active and "coming soon" product, sorted. */
export function subscribeCatalog(next: (products: Product[]) => void, fail: (error: Error) => void) {
  // The status filter is required by the security rules (drafts are admin-only).
  const published = query(productsCol, where('status', 'in', ['active', 'soon']))
  return onSnapshot(
    published,
    (snapshot) => next(sortProducts(snapshot.docs.map((d) => productFromDoc(d.id, d.data())))),
    fail,
  )
}

/** Admin: every product including drafts and hidden ones. */
export function subscribeAllProducts(next: (products: Product[]) => void, fail: (error: Error) => void) {
  return onSnapshot(
    productsCol,
    (snapshot) => next(sortProducts(snapshot.docs.map((d) => productFromDoc(d.id, d.data())))),
    fail,
  )
}

/** Creates (id = null) or updates a product. Returns its id. */
export async function saveProduct(id: string | null, product: ProductInput): Promise<string> {
  const data = productToDoc(product)
  if (id) {
    await updateDoc(doc(productsCol, id), { ...data, updatedAt: serverTimestamp() })
    return id
  }
  const ref = doc(productsCol)
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(productsCol, id))
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  await updateDoc(doc(productsCol, id), { status, updatedAt: serverTimestamp() })
}

/**
 * Adds `delta` (may be negative) to one size's stock, or to `stock` for one-size
 * items (`size = null`). Never goes below zero.
 */
export async function adjustStock(productId: string, size: string | null, delta: number): Promise<void> {
  const ref = doc(productsCol, productId)
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref)
    if (!snapshot.exists()) throw new Error('Бараа олдсонгүй')
    const product = productFromDoc(snapshot.id, snapshot.data())
    if (size === null) {
      tx.update(ref, { stock: Math.max(0, product.stock + delta), updatedAt: serverTimestamp() })
      return
    }
    const sizes = product.sizes.map((s) => (s.label === size ? { ...s, stock: Math.max(0, s.stock + delta) } : s))
    tx.update(ref, { sizes, updatedAt: serverTimestamp() })
  })
}

/** Replaces the whole size run / one-size stock (inventory editor). */
export async function setStock(productId: string, sizes: SizeStock[], stock: number): Promise<void> {
  await updateDoc(doc(productsCol, productId), {
    sizes: sizes.map((size) => ({ label: size.label, stock: Math.max(0, Math.floor(size.stock)) })),
    stock: Math.max(0, Math.floor(stock)),
    updatedAt: serverTimestamp(),
  })
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Uploads a product photo to Storage, reporting progress, and returns its public URL. */
export async function uploadProductImage(file: File | Blob, onProgress?: (note: string) => void): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Зөвхөн зураг оруулна уу')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Зургийн хэмжээ 5MB-аас ихгүй байх ёстой')
  const safeName = (file instanceof File ? file.name : 'image.png').toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
  onProgress?.('Хадгалж байна…')
  const snapshot = await uploadBytes(ref(storage, path), file, { contentType: file.type })
  return getDownloadURL(snapshot.ref)
}

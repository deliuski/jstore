export type Category = 'sneaker' | 'boot' | 'bag'

/**
 * active — on sale · soon — "Удахгүй ирнэ" (pre-order) · draft/hidden — admin only
 */
export type ProductStatus = 'active' | 'soon' | 'draft' | 'hidden'

/** Badge shown on the product image. Derived from the product, never stored. */
export type ProductTag = 'new' | 'sale' | 'out' | 'soon'

export interface SizeStock {
  /** EU size, e.g. "42.5" */
  label: string
  stock: number
}

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  description: string
  /** Prices in ₮. `null` until set — the storefront then shows "[Үнэ] ₮". */
  price: number | null
  /** Pre-discount price, shown struck through while `onSale`. */
  oldPrice: number | null
  /** Shown with the "Хямдрал" badge (and in the sale filter). */
  onSale: boolean
  sku: string
  /** Main photo URL (a /images/... path or a Firebase Storage URL). */
  image: string | null
  /** 'contain' for cut-outs on white, 'cover' for full photos with their own background. */
  imageFit: 'contain' | 'cover'
  /** Extra photos (front, back, sole ...). */
  gallery: string[]
  /** Outlined text used by the image placeholder ("AJ9", "ӨВӨЛ"). */
  mark: string
  /** Size run with stock per size. Empty for one-size items (bags), which use `stock`. */
  sizes: SizeStock[]
  /** Stock of one-size items. Ignored when `sizes` is not empty. */
  stock: number
  isNew: boolean
  /** Shown in the home page "Шинэ ирсэн" grid. */
  featured: boolean
  status: ProductStatus
  /** Lower comes first. */
  sortOrder: number
  createdAt: Date | null
  updatedAt: Date | null
}

export const CATEGORY_LABELS: Record<Category, string> = {
  sneaker: 'Пүүз',
  boot: 'Өвлийн гутал',
  bag: 'Цүнх',
}

export const TAG_LABELS: Record<ProductTag, string> = {
  new: 'Шинэ',
  sale: 'Хямдрал',
  out: 'Дууссан',
  soon: 'Удахгүй',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Идэвхтэй',
  soon: 'Удахгүй ирнэ',
  draft: 'Ноорог',
  hidden: 'Нуусан',
}

export const SNEAKER_SIZES = ['40', '40.5', '41', '42', '42.5', '43', '44', '44.5', '45', '45.5', '46', '47']
export const BOOT_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

/** Stock at or below this is "Дуусаж буй". */
export const LOW_STOCK_THRESHOLD = 2

export function isCategory(value: string | null | undefined): value is Category {
  return typeof value === 'string' && value in CATEGORY_LABELS
}

export function hasSizes(product: Product): boolean {
  return product.sizes.length > 0
}

export function totalStock(product: Product): number {
  return hasSizes(product) ? product.sizes.reduce((sum, size) => sum + size.stock, 0) : product.stock
}

export function isSoldOut(product: Product): boolean {
  return product.status !== 'soon' && totalStock(product) <= 0
}

export function isOnSale(product: Product): boolean {
  return product.onSale
}

export function availableSizes(product: Product): string[] {
  return product.sizes.filter((size) => size.stock > 0).map((size) => size.label)
}

export function getProductTag(product: Product): ProductTag | undefined {
  if (product.status === 'soon') return 'soon'
  if (isSoldOut(product)) return 'out'
  if (isOnSale(product)) return 'sale'
  if (product.isNew) return 'new'
  return undefined
}

/** Visible on the storefront (catalog, product page). */
export function isPublished(product: Product): boolean {
  return product.status === 'active' || product.status === 'soon'
}

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export interface LowStockEntry {
  product: Product
  /** `null` for one-size items. */
  size: string | null
  stock: number
}

/** Sizes (or one-size items) running low but not yet sold out, lowest stock first. */
export function lowStockEntries(products: Product[], threshold = LOW_STOCK_THRESHOLD): LowStockEntry[] {
  const entries: LowStockEntry[] = []
  for (const product of products) {
    if (product.status !== 'active') continue
    if (hasSizes(product)) {
      for (const size of product.sizes) {
        if (size.stock > 0 && size.stock <= threshold) entries.push({ product, size: size.label, stock: size.stock })
      }
    } else if (product.stock > 0 && product.stock <= threshold) {
      entries.push({ product, size: null, stock: product.stock })
    }
  }
  return entries.sort((a, b) => a.stock - b.stock)
}

/** A blank product, used by the admin "new product" form. */
export function emptyProduct(): Omit<Product, 'id'> {
  return {
    name: '',
    brand: '',
    category: 'sneaker',
    description: '',
    price: null,
    oldPrice: null,
    onSale: false,
    sku: '',
    image: null,
    imageFit: 'contain',
    gallery: [],
    mark: '',
    sizes: SNEAKER_SIZES.map((label) => ({ label, stock: 0 })),
    stock: 0,
    isNew: true,
    featured: false,
    status: 'draft',
    sortOrder: 100,
    createdAt: null,
    updatedAt: null,
  }
}

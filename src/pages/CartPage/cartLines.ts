import { MAX_QTY_PER_LINE, type CartItem } from '../../context/shop'
import { itemsSubtotal, type OrderItem } from '../../models/order'
import { hasSizes, type Product } from '../../models/product'

/** Mirrors the `items.size() <= 20` limit in firestore.rules. */
export const MAX_ORDER_LINES = 20

export interface CartLine {
  key: string
  productId: string
  size: string | null
  qty: number
  /** `null` once the product is deleted or no longer published. */
  product: Product | null
  /** Most pieces this line may hold right now. */
  maxQty: number
  /** Why the line blocks checkout, or `null` when it can be ordered. */
  issue: string | null
}

function stockFor(product: Product, size: string | null): number {
  if (size === null) return hasSizes(product) ? 0 : product.stock
  return product.sizes.find((entry) => entry.label === size)?.stock ?? 0
}

function lineIssue(product: Product | null, size: string | null, qty: number, maxQty: number): string | null {
  if (!product) return 'Энэ бараа одоогоор худалдаанд байхгүй байна.'
  if (maxQty <= 0) return size ? `EU ${size} размер дууссан байна.` : 'Энэ бараа дууссан байна.'
  if (qty > maxQty) return `Зөвхөн ${maxQty} ширхэг үлдсэн байна — тоог багасгана уу.`
  return null
}

/** Joins the stored cart with the live catalog (which holds only published products). */
export function resolveCart(cart: CartItem[], catalog: Product[]): CartLine[] {
  return cart.map((item) => {
    const product = catalog.find((entry) => entry.id === item.productId) ?? null
    // Pre-orders ("Удахгүй ирнэ") can be ordered in any size, whatever the stock.
    const maxQty =
      product === null
        ? 0
        : product.status === 'soon'
          ? MAX_QTY_PER_LINE
          : Math.min(MAX_QTY_PER_LINE, stockFor(product, item.size))
    return {
      key: `${item.productId}:${item.size ?? ''}`,
      productId: item.productId,
      size: item.size,
      qty: item.qty,
      product,
      maxQty,
      issue: lineIssue(product, item.size, item.qty, maxQty),
    }
  })
}

/** Why the cart can't be ordered as it is, or `null` when it can. */
export function checkoutBlocker(lines: CartLine[]): string | null {
  if (lines.some((line) => line.issue !== null)) return 'Захиалга өгөхийн өмнө анхааруулгатай барааг засна уу.'
  if (lines.length > MAX_ORDER_LINES) return `Нэг захиалгад ${MAX_ORDER_LINES} хүртэлх төрлийн бараа орно.`
  return null
}

export function productPath(line: Pick<CartLine, 'productId' | 'size'>): string {
  return `/product/${line.productId}${line.size ? `?size=${encodeURIComponent(line.size)}` : ''}`
}

export function cartPieces(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

/** Sum of the orderable lines, or `null` while any of them has no price. */
export function cartSubtotal(lines: CartLine[]): number | null {
  return itemsSubtotal(
    lines.flatMap((line) => (line.product ? [{ price: line.product.price, qty: line.qty }] : [])),
  )
}

/** Any "Удахгүй ирнэ" product makes the whole order a pre-order. */
export function isPreorder(lines: CartLine[]): boolean {
  return lines.some((line) => line.product?.status === 'soon')
}

/** Snapshot of each line as stored on the order. */
export function toOrderItems(lines: CartLine[]): OrderItem[] {
  return lines.flatMap(({ product, size, qty }) =>
    product
      ? [
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            imageFit: product.imageFit,
            mark: product.mark,
            size,
            price: product.price,
            qty,
          },
        ]
      : [],
  )
}

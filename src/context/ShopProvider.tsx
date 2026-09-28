import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MAX_QTY_PER_LINE, ShopContext, type CartItem, type ShopState } from './shop'

const CART_KEY = 'duukhee.cart'
const FAVORITES_KEY = 'duukhee.favorites'

// Browser storage can be unavailable (private mode, blocked site data) — the
// cart then simply lives for this visit only.
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function readCart(): CartItem[] {
  const stored = readStored<unknown>(CART_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored
    .filter((item): item is CartItem => typeof item?.productId === 'string' && typeof item?.qty === 'number')
    .map((item) => ({ productId: item.productId, size: item.size ?? null, qty: Math.min(MAX_QTY_PER_LINE, item.qty) }))
    .filter((item) => item.qty > 0)
}

const sameLine = (item: CartItem, productId: string, size: string | null) =>
  item.productId === productId && item.size === size

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(readCart)
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(
    () => new Set(readStored<string[]>(FAVORITES_KEY, [])),
  )

  useEffect(() => writeStored(CART_KEY, cart), [cart])
  useEffect(() => writeStored(FAVORITES_KEY, [...favorites]), [favorites])

  const addToCart = useCallback((productId: string, size: string | null) => {
    setCart((items) => {
      const existing = items.find((item) => sameLine(item, productId, size))
      if (!existing) return [...items, { productId, size, qty: 1 }]
      return items.map((item) =>
        item === existing ? { ...item, qty: Math.min(MAX_QTY_PER_LINE, item.qty + 1) } : item,
      )
    })
  }, [])

  const setCartQty = useCallback((productId: string, size: string | null, qty: number) => {
    setCart((items) =>
      qty <= 0
        ? items.filter((item) => !sameLine(item, productId, size))
        : items.map((item) =>
            sameLine(item, productId, size) ? { ...item, qty: Math.min(MAX_QTY_PER_LINE, qty) } : item,
          ),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((ids) => {
      const next = new Set(ids)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }, [])

  const value = useMemo<ShopState>(
    () => ({
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
      addToCart,
      setCartQty,
      clearCart,
      favorites,
      toggleFavorite,
    }),
    [cart, addToCart, setCartQty, clearCart, favorites, toggleFavorite],
  )

  return <ShopContext value={value}>{children}</ShopContext>
}

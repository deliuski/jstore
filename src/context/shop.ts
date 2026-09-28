import { createContext, useContext } from 'react'

export interface CartItem {
  productId: string
  /** EU size; `null` for one-size items. */
  size: string | null
  qty: number
}

export interface ShopState {
  cart: CartItem[]
  /** Total number of pieces in the cart. */
  cartCount: number
  /** Adds one piece (merges with the same product + size). */
  addToCart: (productId: string, size: string | null) => void
  /** Sets the quantity; 0 removes the line. */
  setCartQty: (productId: string, size: string | null, qty: number) => void
  clearCart: () => void
  favorites: ReadonlySet<string>
  toggleFavorite: (productId: string) => void
}

export const ShopContext = createContext<ShopState | null>(null)

export function useShop(): ShopState {
  const shop = useContext(ShopContext)
  if (!shop) throw new Error('useShop must be used inside <ShopProvider>')
  return shop
}

export const MAX_QTY_PER_LINE = 10

import type { Product } from '../models/product'
import { CATALOG_PATH } from './site'

export interface HeroSlide {
  id: string
  /** Small uppercase line above the title ("ШИНЭ ИРСЭН", "ОНЦЛОХ"). */
  kicker: string
  title: string
  /** Huge outlined word behind the shoe. */
  ghost: string
  /** The product's photo URL; null renders the ProductImage placeholder tile. */
  image: string | null
  imageAlt: string
  /** Where "ХУДАЛДАЖ АВАХ" goes — the product page. */
  href: string
}

const KICKERS = ['ШИНЭ ИРСЭН', 'ОНЦЛОХ', 'ШИНЭ ИРСЭН'] as const

/**
 * Builds the hero slides from the live catalog: newest published products first,
 * top 3. The kicker alternates ШИНЭ ИРСЭН / ОНЦЛОХ; the ghost word comes from
 * the product mark ("AJ9", "ӨВӨЛ"), falling back to the first word of the name.
 */
export function heroSlidesFromProducts(products: Product[]): HeroSlide[] {
  return products
    .filter((product) => product.status === 'active' || product.status === 'soon')
    .sort((a, b) => Number(b.isNew) - Number(a.isNew) || Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    .slice(0, 3)
    .map((product, index) => ({
      id: product.id,
      kicker: KICKERS[index % KICKERS.length],
      title: product.name,
      ghost: product.mark || product.name.split(' ')[0]?.toUpperCase() || 'ANZO',
      image: product.image,
      imageAlt: product.name,
      href: `/product/${product.id}`,
    }))
}

/** Design-time showcase used only until the catalog has published products. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'aj9',
    kicker: 'ШИНЭ ИРСЭН',
    title: 'Air Jordan 9 Retro «Space Jam»',
    ghost: 'SPACE JAM',
    image: '/images/hero/aj9.png',
    imageAlt: 'Air Jordan 9 Retro',
    href: `${CATALOG_PATH}?q=${encodeURIComponent('Air Jordan 9')}`,
  },
  {
    id: 'aj7',
    kicker: 'ШИНЭ ИРСЭН',
    title: 'Air Jordan 7 Retro «Miro»',
    ghost: 'MIRO',
    image: '/images/hero/aj7.png',
    imageAlt: 'Air Jordan 7 Retro',
    href: `${CATALOG_PATH}?q=${encodeURIComponent('Air Jordan 7')}`,
  },
  {
    id: 'aj16',
    kicker: 'ОНЦЛОХ',
    title: 'Air Jordan 16 Retro',
    ghost: 'AJ 16',
    image: '/images/hero/aj16.png',
    imageAlt: 'Air Jordan 16 Retro',
    href: `${CATALOG_PATH}?q=${encodeURIComponent('Air Jordan 16')}`,
  },
]

import { CATALOG_PATH } from './site'

export interface HeroSlide {
  id: string
  kicker: string
  title: string
  /** Huge outlined word behind the shoes. */
  ghost: string
  /** Transparent PNG cut-out of the shoe. */
  image: string
  imageAlt: string
  /** Where "ХУДАЛДАЖ АВАХ" goes — the catalog searched for this model. */
  href: string
}

const searchFor = (model: string) => `${CATALOG_PATH}?q=${encodeURIComponent(model)}`

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'aj9',
    kicker: 'ШИНЭ ИРСЭН',
    title: 'Air Jordan 9 Retro «Space Jam»',
    ghost: 'SPACE JAM',
    image: '/images/hero/aj9.png',
    imageAlt: 'Air Jordan 9 Retro',
    href: searchFor('Air Jordan 9'),
  },
  {
    id: 'aj7',
    kicker: 'ШИНЭ ИРСЭН',
    title: 'Air Jordan 7 Retro «Miro»',
    ghost: 'MIRO',
    image: '/images/hero/aj7.png',
    imageAlt: 'Air Jordan 7 Retro',
    href: searchFor('Air Jordan 7'),
  },
  {
    id: 'aj16',
    kicker: 'ОНЦЛОХ',
    title: 'Air Jordan 16 Retro',
    ghost: 'AJ 16',
    image: '/images/hero/aj16.png',
    imageAlt: 'Air Jordan 16 Retro',
    href: searchFor('Air Jordan 16'),
  },
]

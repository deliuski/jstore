export interface HeroSlide {
  id: string
  /** Small uppercase line above the title ("ШИНЭ ИРСЭН", "ОНЦЛОХ"). */
  kicker: string
  title: string
  /** Huge outlined word behind the shoe. */
  ghost: string
  /** The banner photo URL; null renders the outlined placeholder tile. */
  image: string | null
  imageAlt: string
  /** Where "ХУДАЛДАЖ АВАХ" goes — the linked product's page (or the catalog). */
  href: string
  /** "ХУДАЛДАЖ АВАХ" button label. */
  ctaLabel: string
}

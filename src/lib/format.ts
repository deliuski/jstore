const priceFormatter = new Intl.NumberFormat('mn-MN')

/** "189,000 ₮", or the design's "[Үнэ] ₮" placeholder while no price is set. */
export function formatPrice(value: number | null | undefined, placeholder = '[Үнэ]'): string {
  return `${value == null ? placeholder : priceFormatter.format(value)} ₮`
}

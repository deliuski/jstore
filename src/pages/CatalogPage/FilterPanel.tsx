import type { ChangeEvent } from 'react'
import { cx } from '../../lib/cx'
import { CATEGORY_LABELS, type Product } from '../../models/product'
import {
  CATEGORIES,
  HIGHLIGHTS,
  HIGHLIGHT_LABELS,
  catalogSizes,
  countMatches,
  hasActiveFilters,
  toggleValue,
  type CatalogFilters,
  type FilterChange,
} from './catalogFilters'
import { useUrlDraft } from './catalogHooks'
import s from './FilterPanel.module.css'

interface FilterPanelProps {
  /** The whole catalog — sizes and counts come from it. */
  products: Product[]
  filters: CatalogFilters
  onChange: FilterChange
  onReset: () => void
}

interface CheckOptionProps {
  label: string
  count: number
  checked: boolean
  onToggle: () => void
}

function CheckOption({ label, count, checked, onToggle }: CheckOptionProps) {
  return (
    <label className={cx(s.check, count === 0 && !checked && s.checkEmpty)}>
      <input type="checkbox" className={s.checkbox} checked={checked} onChange={onToggle} />
      <span className={s.checkLabel}>{label}</span>
      <span className={s.checkCount}>{count}</span>
    </label>
  )
}

interface PriceFieldProps {
  label: string
  placeholder: string
  price: number | null
  onPriceChange: (price: number | null) => void
}

function PriceField({ label, placeholder, price, onPriceChange }: PriceFieldProps) {
  const [draft, setDraft] = useUrlDraft(price === null ? '' : String(price))

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 9)
    setDraft(digits)
    onPriceChange(digits ? Number(digits) : null)
  }

  return (
    <label className={s.priceField}>
      <span className={s.priceLabel}>{label}</span>
      <span className={s.priceBox}>
        <input
          className={s.priceInput}
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={draft}
          onChange={change}
        />
        <span aria-hidden="true">₮</span>
      </span>
    </label>
  )
}

export function FilterPanel({ products, filters, onChange, onReset }: FilterPanelProps) {
  // How many products an option would show, given the other groups.
  const countWith = (patch: Partial<CatalogFilters>) => countMatches(products, { ...filters, ...patch })
  const sizes = catalogSizes(products)

  return (
    <div className={s.panel}>
      <fieldset className={s.group}>
        <legend className={s.title}>Ангилал</legend>
        <div className={s.options}>
          {CATEGORIES.map((category) => (
            <CheckOption
              key={category}
              label={CATEGORY_LABELS[category]}
              count={countWith({ categories: [category] })}
              checked={filters.categories.includes(category)}
              onToggle={() => onChange({ categories: toggleValue(filters.categories, category) })}
            />
          ))}
        </div>
      </fieldset>

      {sizes.length > 0 && (
        <fieldset className={s.group}>
          <legend className={s.title}>Размер</legend>
          <div className={s.sizes}>
            {sizes.map((size) => {
              const selected = filters.sizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  className={cx(s.size, selected && s.sizeSelected)}
                  aria-pressed={selected}
                  onClick={() => onChange({ sizes: toggleValue(filters.sizes, size) })}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <fieldset className={s.group}>
        <legend className={s.title}>Үнэ</legend>
        <div className={s.prices}>
          <PriceField
            label="Доод"
            placeholder="0"
            price={filters.minPrice}
            onPriceChange={(minPrice) => onChange({ minPrice }, { replace: true })}
          />
          <span className={s.priceDash} aria-hidden="true">
            –
          </span>
          <PriceField
            label="Дээд"
            placeholder="∞"
            price={filters.maxPrice}
            onPriceChange={(maxPrice) => onChange({ maxPrice }, { replace: true })}
          />
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.title}>Онцлох</legend>
        <div className={s.options}>
          {HIGHLIGHTS.map((highlight) => (
            <CheckOption
              key={highlight}
              label={HIGHLIGHT_LABELS[highlight]}
              count={countWith({ highlights: [highlight] })}
              checked={filters.highlights.includes(highlight)}
              onToggle={() => onChange({ highlights: toggleValue(filters.highlights, highlight) })}
            />
          ))}
        </div>
      </fieldset>

      <div className={s.group}>
        <label className={s.switchRow}>
          <span>Зөвхөн бэлэн байгаа</span>
          <input
            type="checkbox"
            role="switch"
            className={s.switch}
            checked={filters.inStock}
            onChange={() => onChange({ inStock: !filters.inStock })}
          />
        </label>
      </div>

      <button type="button" className={s.reset} disabled={!hasActiveFilters(filters)} onClick={onReset}>
        Шүүлтүүр цэвэрлэх
      </button>
    </div>
  )
}

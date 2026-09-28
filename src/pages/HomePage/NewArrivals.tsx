import { Link, useSearchParams } from 'react-router'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { ProductCard } from '../../components/ProductCard/ProductCard'
import { ProductGrid } from '../../components/ProductGrid/ProductGrid'
import { CATALOG_PATH } from '../../data/site'
import { useCatalog } from '../../hooks/data'
import { cx } from '../../lib/cx'
import { CATEGORY_LABELS, isCategory, type Category } from '../../models/product'
import s from './NewArrivals.module.css'

type Filter = Category | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'sneaker', label: CATEGORY_LABELS.sneaker },
  { value: 'boot', label: CATEGORY_LABELS.boot },
  { value: 'bag', label: CATEGORY_LABELS.bag },
]

export function NewArrivals() {
  // The active filter lives in the URL (?cat=boot) so header links can open a category.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('cat')
  const filter: Filter = isCategory(category) ? category : 'all'
  const catalog = useCatalog()
  // The home grid shows the products marked "featured" in the admin.
  const featured = (catalog.data ?? []).filter((product) => product.featured && product.status === 'active')
  const products = filter === 'all' ? featured : featured.filter((product) => product.category === filter)

  const selectFilter = (value: Filter) =>
    setSearchParams(value === 'all' ? {} : { cat: value }, { replace: true, preventScrollReset: true })

  return (
    <section id="new" className={s.section} aria-labelledby="new-title">
      <div className={s.head}>
        <h2 id="new-title" className={s.title}>
          Шинэ ирсэн
        </h2>
        <div className={s.filters}>
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={cx(s.filter, value === filter && s.filterActive)}
              aria-pressed={value === filter}
              onClick={() => selectFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {catalog.loading ? (
        <PageLoader />
      ) : catalog.error && !catalog.data ? (
        <PageError />
      ) : products.length === 0 ? (
        <p className={s.empty}>Одоогоор энд харуулах бараа алга.</p>
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showSizes />
          ))}
        </ProductGrid>
      )}

      <div className={s.more}>
        <Link to={CATALOG_PATH} className={s.moreLink}>
          БҮХ БАРААГ ҮЗЭХ
        </Link>
      </div>
    </section>
  )
}

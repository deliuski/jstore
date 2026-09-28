import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { PageError, PageLoader } from '../../components/PageStatus/PageStatus'
import { ProductCard } from '../../components/ProductCard/ProductCard'
import { ProductGrid } from '../../components/ProductGrid/ProductGrid'
import { BRAND } from '../../data/site'
import { useCatalog } from '../../hooks/data'
import { ActiveFilters } from './ActiveFilters'
import { CatalogToolbar } from './CatalogToolbar'
import {
  activeChips,
  applyFilters,
  filterCount,
  hasActiveFilters,
  parseFilters,
  resetFilters,
  serializeFilters,
  type CatalogFilters,
  type FilterChange,
} from './catalogFilters'
import { useMediaQuery } from './catalogHooks'
import { FilterDrawer } from './FilterDrawer'
import { FilterPanel } from './FilterPanel'
import s from './CatalogPage.module.css'

const DRAWER_ID = 'catalog-filters'

export function CatalogPage() {
  const catalog = useCatalog()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // Below 1024px the sidebar turns into a slide-over drawer.
  const compact = useMediaQuery('(max-width: 1023px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  if (drawerOpen && !compact) setDrawerOpen(false)

  // All filter state lives in the URL, so links, reloads and the back button work.
  const filters = parseFilters(searchParams)
  const setFilters = (next: CatalogFilters, replace = false) =>
    navigate({ search: serializeFilters(next) }, { replace })
  const changeFilters: FilterChange = (patch, options) => setFilters({ ...filters, ...patch }, options?.replace)
  const clearFilters = () => setFilters(resetFilters(filters))

  const products = catalog.data
  const results = products ? applyFilters(products, filters) : []

  const panel = products && (
    <FilterPanel products={products} filters={filters} onChange={changeFilters} onReset={clearFilters} />
  )

  return (
    <>
      <title>{`Бүх бараа — ${BRAND.name}`}</title>

      <nav className={s.breadcrumb} aria-label="Талх мөр">
        <ol className={s.crumbs}>
          <li>
            <Link to="/" className={s.crumbLink}>
              Нүүр
            </Link>
          </li>
          <li className={s.crumbCurrent} aria-current="page">
            Бүх бараа
          </li>
        </ol>
      </nav>

      <div className={s.head}>
        <h1 className={s.title}>Бүх бараа</h1>
        {products && (
          <p className={s.count} role="status">
            {results.length} бараа
          </p>
        )}
      </div>

      {products ? (
        <div className={s.layout}>
          {compact ? (
            <FilterDrawer
              id={DRAWER_ID}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              resultCount={results.length}
            >
              {panel}
            </FilterDrawer>
          ) : (
            <aside className={s.sidebar} aria-label="Шүүлтүүр">
              {panel}
            </aside>
          )}

          <div className={s.content}>
            <CatalogToolbar
              query={filters.query}
              sort={filters.sort}
              onChange={changeFilters}
              filterButton={
                compact
                  ? {
                      drawerId: DRAWER_ID,
                      count: filterCount(filters),
                      expanded: drawerOpen,
                      onOpen: () => setDrawerOpen(true),
                    }
                  : undefined
              }
            />
            <ActiveFilters
              chips={activeChips(filters)}
              onRemove={(chip) => changeFilters(chip.remove)}
              onReset={clearFilters}
            />

            {results.length > 0 ? (
              <ProductGrid className={s.grid}>
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} showSizes />
                ))}
              </ProductGrid>
            ) : (
              <div className={s.empty}>
                <h2 className={s.emptyTitle}>Тохирох бараа олдсонгүй</h2>
                <p className={s.emptyText}>Шүүлтүүрээ өөрчлөх эсвэл цэвэрлээд дахин үзнэ үү.</p>
                {hasActiveFilters(filters) && (
                  <button type="button" className={s.emptyReset} onClick={clearFilters}>
                    Шүүлтүүр цэвэрлэх
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : catalog.loading ? (
        <PageLoader />
      ) : (
        <PageError />
      )}
    </>
  )
}

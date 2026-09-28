import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { SearchIcon } from '../../components/icons'
import { SORT_OPTIONS, toSortKey, type FilterChange, type SortKey } from './catalogFilters'
import { useUrlDraft } from './catalogHooks'
import s from './CatalogToolbar.module.css'

interface CatalogToolbarProps {
  query: string
  sort: SortKey
  onChange: FilterChange
  /** Tablet/mobile only: opens the filter drawer. */
  filterButton?: {
    drawerId: string
    count: number
    expanded: boolean
    onOpen: () => void
  }
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  )
}

export function CatalogToolbar({ query, sort, onChange, filterButton }: CatalogToolbarProps) {
  const [draft, setDraft] = useUrlDraft(query)
  const searchRef = useRef<HTMLInputElement>(null)
  const { hash, key } = useLocation()

  // The header search icon links to /products#search.
  useEffect(() => {
    if (hash === '#search') searchRef.current?.focus()
  }, [hash, key])

  const search = (value: string) => {
    setDraft(value)
    onChange({ query: value }, { replace: true })
  }

  return (
    <div className={s.toolbar}>
      <div className={s.search} role="search">
        <label htmlFor="search" className="visually-hidden">
          Бараа хайх
        </label>
        <SearchIcon size={20} className={s.searchIcon} />
        <input
          ref={searchRef}
          id="search"
          type="search"
          className={s.searchInput}
          placeholder="Нэр, брэнд, код…"
          autoComplete="off"
          value={draft}
          onChange={(event) => search(event.target.value)}
        />
      </div>

      {filterButton && (
        <button
          type="button"
          className={s.filterButton}
          aria-haspopup="dialog"
          aria-controls={filterButton.drawerId}
          aria-expanded={filterButton.expanded}
          onClick={filterButton.onOpen}
        >
          <FilterIcon />
          Шүүлтүүр ({filterButton.count})
        </button>
      )}

      <div className={s.sort}>
        <label htmlFor="catalog-sort" className="visually-hidden">
          Эрэмбэлэх
        </label>
        <select
          id="catalog-sort"
          className={s.sortSelect}
          value={sort}
          onChange={(event) => onChange({ sort: toSortKey(event.target.value) })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

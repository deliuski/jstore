import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons'
import { Button } from '../../components/Button/Button'
import s from './Pager.module.css'

interface PagerProps {
  /** 1-based. */
  page: number
  pageCount: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

/** "26–50 / 132" with previous / next buttons; hidden when everything fits on one page. */
export function Pager({ page, pageCount, total, pageSize, onChange }: PagerProps) {
  if (pageCount <= 1) return null
  const first = (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  return (
    <nav className={s.pager} aria-label="Хуудас">
      <p className={s.range}>
        {first}–{last} / {total}
      </p>
      <div className={s.buttons}>
        <Button
          variant="secondary"
          size="sm"
          icon={<ChevronLeftIcon size={16} strokeWidth={2} />}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Өмнөх
        </Button>
        <span className={s.current}>
          {page} / {pageCount}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Дараах
          <ChevronRightIcon size={16} strokeWidth={2} />
        </Button>
      </div>
    </nav>
  )
}

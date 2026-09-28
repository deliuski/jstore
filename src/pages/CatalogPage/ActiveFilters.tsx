import { CloseIcon } from '../../components/icons'
import type { FilterChip } from './catalogFilters'
import s from './ActiveFilters.module.css'

interface ActiveFiltersProps {
  chips: FilterChip[]
  onRemove: (chip: FilterChip) => void
  onReset: () => void
}

export function ActiveFilters({ chips, onRemove, onReset }: ActiveFiltersProps) {
  if (chips.length === 0) return null

  return (
    <ul className={s.chips} aria-label="Идэвхтэй шүүлтүүр">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            className={s.chip}
            aria-label={`${chip.label} — шүүлтүүр арилгах`}
            onClick={() => onRemove(chip)}
          >
            {chip.label}
            <CloseIcon size={14} strokeWidth={2.2} />
          </button>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <button type="button" className={s.clear} onClick={onReset}>
            Бүгдийг цэвэрлэх
          </button>
        </li>
      )}
    </ul>
  )
}

import { Link } from 'react-router'
import type { SizeStock } from '../../models/product'
import { SIZE_GUIDE_PATH } from '../../data/site'
import { cx } from '../../lib/cx'
import s from './SizePicker.module.css'

interface SizePickerProps {
  sizes: SizeStock[]
  selected: string | null
  onSelect: (size: string) => void
  /** Pre-order: every size can be chosen, whatever the stock. */
  preorder?: boolean
}

export function SizePicker({ sizes, selected, onSelect, preorder = false }: SizePickerProps) {
  return (
    <div className={s.picker}>
      <div className={s.head}>
        <span className={s.title}>
          Размер (EU) <span className={s.selected}>{selected ? `Сонгосон: ${selected}` : 'Сонгоогүй'}</span>
        </span>
        <Link to={SIZE_GUIDE_PATH} className={s.guide}>
          Размерын заавар
        </Link>
      </div>

      <div className={s.grid} role="group" aria-label="Размер сонгох">
        {sizes.map(({ label, stock }) => (
          <button
            key={label}
            type="button"
            className={cx(s.size, label === selected && s.sizeSelected)}
            disabled={!preorder && stock <= 0}
            aria-pressed={label === selected}
            aria-label={preorder || stock > 0 ? undefined : `${label} дууссан`}
            onClick={() => onSelect(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

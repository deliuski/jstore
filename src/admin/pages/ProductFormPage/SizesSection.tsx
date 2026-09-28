import { useState } from 'react'
import { CloseIcon, PlusIcon } from '../../../components/icons'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { FilterChips } from '../../components/FilterChips/FilterChips'
import { NumberField } from '../../components/Form/NumberField'
import { TextField } from '../../components/Form/TextField'
import {
  SIZE_PRESETS,
  currentPreset,
  draftTotal,
  presetRows,
  sizeRow,
  type DraftErrors,
  type DraftUpdate,
  type ProductDraft,
  type SizePreset,
  type SizeRow,
} from './productForm'
import s from './SizesSection.module.css'

interface SizesSectionProps {
  draft: ProductDraft
  onChange: DraftUpdate
  errors: DraftErrors
  className?: string
}

/** "Размер ба нөөц": a size run with stock per size, or one stock number for one-size items. */
export function SizesSection({ draft, onChange, errors, className }: SizesSectionProps) {
  // Focus goes to the label of a row the owner just added.
  const [addedKey, setAddedKey] = useState<number | null>(null)

  const updateRow = (key: number, patch: Partial<SizeRow>) =>
    onChange((current) => ({ sizes: current.sizes.map((row) => (row.key === key ? { ...row, ...patch } : row)) }))

  const removeRow = (key: number) =>
    onChange((current) => ({ sizes: current.sizes.filter((row) => row.key !== key) }))

  const addRow = () => {
    const row = sizeRow()
    setAddedKey(row.key)
    onChange((current) => ({ sizes: [...current.sizes, row] }))
  }

  const applyPreset = (preset: SizePreset | 'custom') => {
    if (preset !== 'custom') onChange((current) => ({ sizes: presetRows(preset, current.sizes) }))
  }

  return (
    <Card
      title="Размер ба нөөц"
      className={className}
      headerExtra={
        <p className={s.total}>
          Нийт <strong className={s.totalValue}>{draftTotal(draft)}</strong> ширхэг
        </p>
      }
    >
      <FilterChips<SizePreset | 'custom'>
        className={s.presets}
        label="Размерын загвар"
        options={SIZE_PRESETS}
        value={currentPreset(draft.sizes)}
        onChange={applyPreset}
      />

      {draft.sizes.length > 0 ? (
        <>
          <p className={s.hint}>Размер (EU) ба тухайн размерын нөөц. Загвар сонгоход оруулсан нөөц хадгалагдана.</p>
          <ul className={s.rows}>
            {draft.sizes.map((row, index) => {
              const name = row.label.trim() ? `EU ${row.label.trim()}` : `Размер ${index + 1}`
              const rowErrors = errors.sizes[row.key]
              return (
                <li key={row.key} className={s.row}>
                  <TextField
                    className={s.label}
                    label={`Размер ${index + 1}`}
                    hideLabel
                    value={row.label}
                    placeholder="EU"
                    inputMode="decimal"
                    autoFocus={row.key === addedKey}
                    error={rowErrors?.label}
                    onChange={(event) => updateRow(row.key, { label: event.target.value })}
                  />
                  <NumberField
                    className={s.stock}
                    label={`${name} нөөц`}
                    hideLabel
                    value={row.stock}
                    min={0}
                    stepper
                    error={rowErrors?.stock}
                    onChange={(stock) => updateRow(row.key, { stock })}
                  />
                  <button
                    type="button"
                    className={s.remove}
                    aria-label={`${name} хасах`}
                    onClick={() => removeRow(row.key)}
                  >
                    <CloseIcon size={16} strokeWidth={2} />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <NumberField
          className={s.oneSize}
          label="Нөөц (ширхэг)"
          hint="Размергүй бараа — цүнх гэх мэт"
          value={draft.stock}
          min={0}
          stepper
          error={errors.fields.stock}
          onChange={(stock) => onChange({ stock })}
        />
      )}

      <Button variant="secondary" size="sm" className={s.addRow} icon={<PlusIcon size={16} />} onClick={addRow}>
        Размер нэмэх
      </Button>
    </Card>
  )
}

import { useState } from 'react'
import type { ShipmentSettings } from '../../../models/settings'
import { saveShipment } from '../../../services/settings'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { NumberField } from '../../components/Form/NumberField'
import { TextField } from '../../components/Form/TextField'
import { useToast } from '../../components/Toast/toast'
import { parseShipmentDraft, sameDraft, toShipmentDraft, type ShipmentDraft } from './preorders'
import s from './ShipmentForm.module.css'

interface ShipmentFormProps {
  /** Live (saved) settings. */
  settings: ShipmentSettings
  booked: number
  className?: string
}

/** Next shipment's arrival and pre-order capacity. Edits stay in a draft until saved. */
export function ShipmentForm({ settings, booked, className }: ShipmentFormProps) {
  const toast = useToast()
  // `null` = not edited, so the fields follow the saved (live) values.
  const [draft, setDraft] = useState<ShipmentDraft | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)

  const saved = toShipmentDraft(settings)
  const values = draft ?? saved
  const changed = draft !== null && !sameDraft(draft, saved)
  const parsed = parseShipmentDraft(values)
  const errors = showErrors ? parsed.errors : null

  const edit = (patch: Partial<ShipmentDraft>) => setDraft({ ...values, ...patch })

  const reset = () => {
    setDraft(null)
    setShowErrors(false)
  }

  const save = async () => {
    if (!parsed.settings) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    try {
      await saveShipment(parsed.settings)
      reset()
      toast('Ачааны мэдээлэл хадгалагдлаа')
    } catch {
      toast('Ачааны мэдээллийг хадгалж чадсангүй', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Ачааны тохиргоо" className={className}>
      <form
        className={s.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        <fieldset className={s.arrival} disabled={saving}>
          <legend className="visually-hidden">Ачаа ирэх хугацаа</legend>
          <TextField
            type="date"
            label="Ирэх өдөр"
            className={s.day}
            value={values.day}
            error={errors?.day}
            onChange={(event) => edit({ day: event.target.value })}
          />
          <TextField
            type="time"
            label="Цаг"
            className={s.time}
            value={values.time}
            error={errors?.time}
            onChange={(event) => edit({ time: event.target.value })}
          />
        </fieldset>
        {values.day && (
          <Button variant="ghost" size="sm" className={s.clear} disabled={saving} onClick={() => edit({ day: '', time: '' })}>
            Товлолтыг арилгах
          </Button>
        )}

        <NumberField
          label="Урьдчилсан захиалгын багтаамж"
          suffix="ш"
          min={0}
          value={values.capacity}
          error={errors?.capacity}
          hint={`Одоогоор ${booked} ш захиалагдсан. Нүүр самбарт «${booked} / багтаамж» гэж харагдана.`}
          disabled={saving}
          onChange={(capacity) => edit({ capacity })}
        />

        <div className={s.actions}>
          <Button type="submit" busy={saving} disabled={!changed}>
            Хадгалах
          </Button>
          {changed && (
            <Button variant="secondary" disabled={saving} onClick={reset}>
              Болих
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

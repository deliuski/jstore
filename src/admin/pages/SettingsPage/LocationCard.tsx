import type { ClipboardEvent } from 'react'
import { StoreMap } from '../../../components/StoreMap/StoreMap'
import type { LatLng } from '../../../models/settings'
import { Card } from '../../components/Card/Card'
import { Select } from '../../components/Form/Select'
import { TextField } from '../../components/Form/TextField'
import {
  MAP_ZOOM_LEVELS,
  formLocation,
  formatCoordinate,
  parseCoordinatePair,
  type StoreForm,
  type StoreFormErrors,
} from './storeForm'
import s from './LocationCard.module.css'

type LocationFields = Pick<StoreForm, 'lat' | 'lng' | 'mapZoom'>

interface LocationCardProps {
  form: LocationFields
  errors: StoreFormErrors
  /** Where the pin stays while a typed coordinate is invalid. */
  fallback: LatLng
  onChange: (patch: Partial<LocationFields>) => void
}

const ZOOM_OPTIONS = MAP_ZOOM_LEVELS.map((zoom) => ({ value: String(zoom), label: String(zoom) }))

/** "Байршил": the map pin, its coordinates and the zoom customers see — saved with the store form. */
export function LocationCard({ form, errors, fallback, onChange }: LocationCardProps) {
  const location = formLocation(form) ?? fallback

  const moveTo = ({ lat, lng }: LatLng) => onChange({ lat: formatCoordinate(lat), lng: formatCoordinate(lng) })

  // A "lat, lng" pair pasted into either field fills both; any other paste is left to the input.
  const pastePair = (event: ClipboardEvent<HTMLInputElement>) => {
    const pair = parseCoordinatePair(event.clipboardData.getData('text'))
    if (!pair) return
    event.preventDefault()
    onChange(pair)
  }

  return (
    <Card title="Байршил">
      <p className={s.lead}>Газрын зураг дээр дарж эсвэл тэмдэгийг чирж байршлаа сонгоно уу.</p>

      <div className={s.mapFrame}>
        {/* StoreMap reads its zoom only when it mounts, so a new zoom remounts it. */}
        <StoreMap
          key={form.mapZoom}
          className={s.map}
          location={location}
          zoom={Number(form.mapZoom)}
          onChange={moveTo}
          label="Дэлгүүрийн байршлыг сонгох газрын зураг"
        />
      </div>

      <div className={s.controls}>
        <Select
          label="Томруулалт"
          className={s.zoom}
          value={form.mapZoom}
          options={ZOOM_OPTIONS}
          onChange={(event) => onChange({ mapZoom: event.target.value })}
        />
        <TextField
          label="Өргөрөг (lat)"
          name="lat"
          inputMode="decimal"
          autoComplete="off"
          value={form.lat}
          error={errors.lat}
          onChange={(event) => onChange({ lat: event.target.value })}
          onPaste={pastePair}
        />
        <TextField
          label="Уртраг (lng)"
          name="lng"
          inputMode="decimal"
          autoComplete="off"
          value={form.lng}
          error={errors.lng}
          onChange={(event) => onChange({ lng: event.target.value })}
          onPaste={pastePair}
        />
      </div>
      <p className={s.hint}>
        Томруулалт 13 — алсаас, 18 — хамгийн ойроос. Google Maps-аас хуулсан «47.9186, 106.9177» хэлбэрийн байршлыг
        аль нэг талбарт шууд буулгаж болно.
      </p>
    </Card>
  )
}

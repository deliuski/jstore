import 'leaflet/dist/leaflet.css'
import { divIcon, type LeafletMouseEvent } from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from '../../models/settings'
import { cx } from '../../lib/cx'
import s from './StoreMap.module.css'

// Satellite view with attribution. This avoids the CARTO key/watermark problem while
// matching the requested aerial map styling.
const TILES_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const TILES_ATTRIBUTION =
  'Tiles &copy; Esri, Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

// A plain CSS pin instead of Leaflet's default PNG marker (which bundlers break).
const pinIcon = divIcon({
  className: s.pinWrap,
  html: `<span class="${s.pin}"></span>`,
  iconSize: [36, 46],
  iconAnchor: [18, 44],
})

interface StoreMapProps {
  location: LatLng
  zoom: number
  className?: string
  /** Admin: click the map or drag the pin to move the store. */
  onChange?: (location: LatLng) => void
  /** Accessible description of the map. */
  label?: string
}

/** Keeps the view centred when the location changes from outside (e.g. settings load). */
function Recenter({ location }: { location: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([location.lat, location.lng], map.getZoom(), { animate: false })
  }, [map, location.lat, location.lng])
  return null
}

function ClickToMove({ onChange }: { onChange: (location: LatLng) => void }) {
  useMapEvents({
    click: (event: LeafletMouseEvent) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }),
  })
  return null
}

export function StoreMap({ location, zoom, className, onChange, label = 'Дэлгүүрийн байршлын газрын зураг' }: StoreMapProps) {
  const editable = Boolean(onChange)

  return (
    <div className={cx(s.map, className)} role="region" aria-label={label}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={zoom}
        scrollWheelZoom={editable}
        className={s.leaflet}
      >
        <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />
        <Marker
          position={[location.lat, location.lng]}
          icon={pinIcon}
          draggable={editable}
          eventHandlers={
            onChange
              ? {
                  dragend: (event) => {
                    const { lat, lng } = event.target.getLatLng()
                    onChange({ lat, lng })
                  },
                }
              : undefined
          }
        />
        <Recenter location={location} />
        {onChange && <ClickToMove onChange={onChange} />}
      </MapContainer>
    </div>
  )
}

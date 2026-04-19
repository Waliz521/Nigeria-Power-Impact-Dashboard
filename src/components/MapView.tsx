import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { TerritoryLayers } from './TerritoryLayers'
import { WorldExcludeMaskLayer } from './WorldExcludeMaskLayer'
import type { TerritoryRecord } from '../types'

const NIGERIA_CENTER: [number, number] = [9.2, 8.2]
const DEFAULT_ZOOM = 6

function ZoomBottomLeft() {
  const map = useMap()
  useEffect(() => {
    map.zoomControl?.setPosition('bottomleft')
  }, [map])
  return null
}

function MapSizeSync() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const sync = () => map.invalidateSize({ animate: false })
    const ro = new ResizeObserver(() => requestAnimationFrame(sync))
    ro.observe(el)
    sync()
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [map])
  return null
}

export function MapView({
  onTerritorySelect,
  showPolygons,
  showMarkers,
  showWorldExcludeMask,
}: {
  onTerritorySelect: (t: TerritoryRecord) => void
  showPolygons: boolean
  showMarkers: boolean
  showWorldExcludeMask: boolean
}) {
  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full min-h-[280px]"
      scrollWheelZoom
      style={{ touchAction: 'manipulation' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      <WorldExcludeMaskLayer visible={showWorldExcludeMask} />
      <ZoomBottomLeft />
      <MapSizeSync />
      <TerritoryLayers
        onTerritorySelect={onTerritorySelect}
        showPolygons={showPolygons}
        showMarkers={showMarkers}
      />
    </MapContainer>
  )
}

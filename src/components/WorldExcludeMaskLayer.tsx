import { useEffect, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'

const MASK_PANE = 'maskPane'
const MASK_URL = `${import.meta.env.BASE_URL}geojson/nigeria-excluded-mask.geojson`

function MaskPaneSetup() {
  const map = useMap()
  useEffect(() => {
    if (map.getPane(MASK_PANE)) return
    const pane = map.createPane(MASK_PANE)
    pane.style.zIndex = '350'
    pane.style.pointerEvents = 'none'
  }, [map])
  return null
}

export function WorldExcludeMaskLayer({ visible }: { visible: boolean }) {
  const [data, setData] = useState<FeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) {
      setData(null)
      setError(null)
      return
    }
    let cancelled = false
    setError(null)
    fetch(MASK_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Mask GeoJSON ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (!cancelled) setData(json as FeatureCollection)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Mask load failed')
      })
    return () => {
      cancelled = true
    }
  }, [visible])

  if (!visible) return null

  return (
    <>
      <MaskPaneSetup />
      {data && !error ? (
        <GeoJSON
          data={data}
          pane={MASK_PANE}
          style={{
            fillColor: '#64748b',
            fillOpacity: 0.52,
            color: '#475569',
            weight: 0.25,
            opacity: 0.35,
          }}
          onEachFeature={(_, layer) => {
            const path = layer as unknown as { options?: { interactive?: boolean } }
            if (path.options) path.options.interactive = false
          }}
        />
      ) : null}
    </>
  )
}

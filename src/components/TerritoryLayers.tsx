import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { PathOptions, LeafletEvent } from 'leaflet'
import { bbox, center, featureCollection, point, union as turfUnion } from '@turf/turf'
import { TERRITORY_GEOMETRY } from '../data/territoryGeometryConfig'
import { statusStyleColor } from '../data/statusColors'
import { useTerritoryData } from '../context/DataContext'
import { useMapContext } from '../context/MapContext'
import type { TerritoryRecord, PowerStatus } from '../types'

const BASE_POLY: PathOptions = { weight: 1.5, fillOpacity: 0.38 }
const HOVER_POLY: PathOptions = { weight: 2.5, fillOpacity: 0.52 }

const ALL_STATES_GREY: PathOptions = {
  color: '#9ca3af',
  weight: 1,
  fillColor: '#e5e7eb',
  fillOpacity: 0.55,
}

function mergeStatePolygons(
  features: Feature<Polygon | MultiPolygon>[],
): Feature<Polygon | MultiPolygon> | null {
  if (features.length === 0) return null
  if (features.length === 1) return features[0]
  try {
    const u = turfUnion(
      featureCollection(features) as FeatureCollection<Polygon | MultiPolygon>,
    )
    return u ?? features[0]
  } catch {
    return features[0]
  }
}

function buildStateIndex(collection: FeatureCollection): Map<string, Feature<Polygon | MultiPolygon>> {
  const m = new Map<string, Feature<Polygon | MultiPolygon>>()
  for (const f of collection.features) {
    const name = (f.properties as { name?: string } | null)?.name
    if (name && f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')) {
      m.set(name, f as Feature<Polygon | MultiPolygon>)
    }
  }
  return m
}

function FitMapBounds({
  collection,
  filterActive,
}: {
  collection: FeatureCollection | null
  filterActive: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (!collection?.features.length) return
    try {
      const [minX, minY, maxX, maxY] = bbox(collection)
      map.fitBounds(
        [
          [minY, minX],
          [maxY, maxX],
        ],
        {
          padding: filterActive ? [28, 28] : [16, 16],
          maxZoom: filterActive ? 10 : 8,
          animate: true,
        },
      )
    } catch {
      /* ignore */
    }
  }, [map, collection, filterActive])
  return null
}

interface MarkerSpec {
  sn: number
  status: PowerStatus
  position: [number, number]
  label: string
}

const POLYGON_PANE = 'overlayPane'
const CITY_MARKER_PANE = 'markerPane'

export function TerritoryLayers({
  onTerritorySelect,
  showPolygons,
  showMarkers,
}: {
  onTerritorySelect: (t: TerritoryRecord) => void
  showPolygons: boolean
  showMarkers: boolean
}) {
  const { filters } = useMapContext()
  const { territories, bySn } = useTerritoryData()
  const [statesGeo, setStatesGeo] = useState<FeatureCollection | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/geojson/nigeria-states.geojson')
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON ${r.status}`)
        return r.json()
      })
      .then(setStatesGeo)
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load map data'))
  }, [])

  const stateByName = useMemo(() => {
    if (!statesGeo) return null
    return buildStateIndex(statesGeo)
  }, [statesGeo])

  const filterActive = Boolean(
    filters.territoryId || filters.cityTerritoryId || filters.status,
  )

  const visibleTerritories = useMemo(() => {
    const { territoryId, cityTerritoryId, status } = filters
    return territories.filter((t) => {
      const rule = TERRITORY_GEOMETRY[t.sn]
      if (!rule) return false
      if (status && t.status !== status) return false

      if (territoryId && cityTerritoryId) {
        const matchState = rule.kind === 'polygon' && String(t.sn) === territoryId
        const matchCity = rule.kind === 'point' && String(t.sn) === cityTerritoryId
        return matchState || matchCity
      }
      if (territoryId) {
        if (rule.kind !== 'polygon') return false
        return String(t.sn) === territoryId
      }
      if (cityTerritoryId) {
        if (rule.kind !== 'point') return false
        return String(t.sn) === cityTerritoryId
      }
      return true
    })
  }, [territories, filters])

  const allowedStateNames = useMemo(() => {
    const s = new Set<string>()
    for (const t of visibleTerritories) {
      const rule = TERRITORY_GEOMETRY[t.sn]
      if (rule) for (const n of rule.states) s.add(n)
    }
    return s
  }, [visibleTerritories])

  const greyStatesGeo = useMemo((): FeatureCollection | null => {
    if (!statesGeo) return null
    if (!filterActive) return statesGeo
    return {
      ...statesGeo,
      features: statesGeo.features.filter((f) =>
        allowedStateNames.has((f.properties as { name?: string } | null)?.name ?? ''),
      ),
    }
  }, [statesGeo, filterActive, allowedStateNames])

  const { polygonFc, markers } = useMemo(() => {
    const polygons: Feature<Polygon | MultiPolygon>[] = []
    const markerList: MarkerSpec[] = []
    if (!stateByName) return { polygonFc: null, markers: markerList }

    for (const t of visibleTerritories) {
      const rule = TERRITORY_GEOMETRY[t.sn]
      if (!rule) continue
      const stateFeatures = rule.states
        .map((nm) => stateByName.get(nm))
        .filter((f): f is Feature<Polygon | MultiPolygon> => Boolean(f))

      if (rule.kind === 'polygon' && stateFeatures.length > 0) {
        const merged = mergeStatePolygons(stateFeatures)
        if (merged) {
          polygons.push({
            type: 'Feature',
            properties: { sn: t.sn, status: t.status },
            geometry: merged.geometry,
          })
        }
      }

      if (rule.kind === 'point' && stateFeatures.length > 0) {
        const c = center(stateFeatures[0])
        const [lng, lat] = c.geometry.coordinates
        const [dLat = 0, dLng = 0] = rule.offset ?? []
        markerList.push({
          sn: t.sn,
          status: t.status,
          position: [lat + dLat, lng + dLng],
          label: t.territoryLabel,
        })
      }
    }

    const polygonFc: FeatureCollection | null =
      polygons.length > 0 ? { type: 'FeatureCollection', features: polygons } : null

    return { polygonFc, markers: markerList }
  }, [visibleTerritories, stateByName])

  const fitCollection = useMemo((): FeatureCollection | null => {
    const feats: Feature[] = []
    if (showPolygons && greyStatesGeo?.features.length) feats.push(...greyStatesGeo.features)
    if (showPolygons && polygonFc?.features.length) feats.push(...polygonFc.features)
    if (showMarkers) {
      for (const m of markers) {
        feats.push(point([m.position[1], m.position[0]]))
      }
    }
    if (!feats.length) return null
    return { type: 'FeatureCollection', features: feats }
  }, [greyStatesGeo, polygonFc, markers, showPolygons, showMarkers])

  const layerKey = `${filters.territoryId}-${filters.cityTerritoryId}-${filters.status}-${showPolygons}-${showMarkers}`

  if (loadError) {
    return (
      <div className="absolute left-3 top-14 z-[1000] max-w-[min(90vw,360px)] rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 shadow">
        {loadError}
      </div>
    )
  }

  if (!statesGeo || !stateByName || !greyStatesGeo) {
    return null
  }

  const styleFor = (feat?: Feature | null): PathOptions => {
    const st = feat?.properties?.status as PowerStatus | undefined
    const color = statusStyleColor(st ?? 'warning')
    return {
      ...BASE_POLY,
      color: '#1f2937',
      fillColor: color,
    }
  }

  return (
    <>
      <FitMapBounds collection={fitCollection} filterActive={filterActive} />
      {showPolygons ? (
        <GeoJSON
          key={`grey-${layerKey}`}
          data={greyStatesGeo}
          pane={POLYGON_PANE}
          style={() => ALL_STATES_GREY}
          onEachFeature={(feature, layer) => {
            const name = (feature.properties as { name?: string } | null)?.name ?? 'State'
            layer.bindTooltip(name, {
              sticky: true,
              className: 'rounded border-0 bg-white/95 px-2 py-1 text-xs text-gray-700 shadow',
            })
          }}
        />
      ) : null}
      {showPolygons && polygonFc ? (
        <GeoJSON
          key={`data-${layerKey}`}
          data={polygonFc}
          pane={POLYGON_PANE}
          style={styleFor}
          onEachFeature={(feature, layer) => {
            const sn = feature.properties?.sn as number | undefined
            const rec = sn != null ? bySn.get(sn) : undefined
            if (rec) {
              layer.bindTooltip(rec.territoryLabel, {
                sticky: true,
                className: 'rounded border-0 bg-white/95 px-2 py-1 text-xs shadow',
              })
            }
            layer.on({
              click: () => {
                if (rec) onTerritorySelect(rec)
              },
              mouseover: (e: LeafletEvent) => {
                const t = e.target as { setStyle: (p: PathOptions) => void }
                t.setStyle({ ...HOVER_POLY, fillColor: styleFor(feature).fillColor, color: '#111827' })
              },
              mouseout: (e: LeafletEvent) => {
                ;(e.target as { setStyle: (p: PathOptions) => void }).setStyle(styleFor(feature))
              },
            })
          }}
        />
      ) : null}
      {showMarkers &&
        markers.map((m) => {
          const rec = bySn.get(m.sn)
          if (!rec) return null
          const fill = statusStyleColor(m.status)
          return (
            <CircleMarker
              key={`${layerKey}-${m.sn}`}
              center={m.position}
              radius={12}
              pane={CITY_MARKER_PANE}
              pathOptions={{
                color: '#111827',
                weight: 2,
                fillColor: fill,
                fillOpacity: 0.92,
              }}
              eventHandlers={{
                click: () => onTerritorySelect(rec),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={0.95}
                className="rounded border-0 px-2 py-1 text-xs"
              >
                {m.label}
              </Tooltip>
            </CircleMarker>
          )
        })}
    </>
  )
}

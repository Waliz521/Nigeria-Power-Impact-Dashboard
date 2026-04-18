/**
 * Maps each Excel row (s/n) to Nigeria state names as they appear in
 * `public/geojson/nigeria-states.geojson` → Feature.properties.name
 *
 * kind `polygon`: merged state boundary(ies) — only rows that “own” a fill.
 * kind `point`: marker at state centroid + offset (sub-state / city / LGA rows).
 */
export type GeometryKind = 'polygon' | 'point'

export interface TerritoryGeometryRule {
  /** Natural Earth / GeoJSON `properties.name` values */
  states: string[]
  kind: GeometryKind
  /** Added to centroid [lat, lng] in degrees (spreads overlapping markers). */
  offset?: [number, number]
}

/** Key = Excel `s/n` */
export const TERRITORY_GEOMETRY: Record<number, TerritoryGeometryRule> = {
  1: { states: ['Osun', 'Ondo'], kind: 'polygon' },
  2: { states: ['Borno', 'Yobe'], kind: 'polygon' },
  3: { states: ['Oyo'], kind: 'polygon' },
  4: { states: ['Lagos'], kind: 'polygon' },
  5: { states: ['Rivers', 'Bayelsa'], kind: 'polygon' },
  6: { states: ['Federal Capital Territory'], kind: 'polygon' },
  7: { states: ['Oyo'], kind: 'point', offset: [0.35, 0.09] },
  8: { states: ['Ogun'], kind: 'point', offset: [0.12, -0.06] },
  9: { states: ['Oyo'], kind: 'point', offset: [-0.3, 0.11] },
  10: { states: ['Oyo'], kind: 'point', offset: [0.14, -0.19] },
  11: { states: ['Oyo'], kind: 'point', offset: [-0.08, -0.21] },
  12: { states: ['Oyo'], kind: 'point', offset: [0.24, 0.17] },
}

/**
 * Maps each imported row (`TerritoryRecord.id`) to Nigeria state names as in
 * `public/geojson/nigeria-states.geojson` → Feature.properties.name
 *
 * kind `polygon`: merged state boundary(ies) — row “owns” a fill.
 * kind `point`: marker at state centroid + offset (sub-state / city / LGA rows).
 */
export type GeometryKind = 'polygon' | 'point'

export interface TerritoryGeometryRule {
  states: string[]
  kind: GeometryKind
  offset?: [number, number]
}

/** Key = `TerritoryRecord.id` from import (not raw Excel s/n when duplicates exist) */
export const TERRITORY_GEOMETRY: Record<string, TerritoryGeometryRule> = {
  '1': { states: ['Osun', 'Ondo'], kind: 'polygon' },
  '2': { states: ['Borno', 'Yobe'], kind: 'polygon' },
  '3': { states: ['Oyo'], kind: 'polygon' },
  '4': { states: ['Lagos'], kind: 'polygon' },
  '5': { states: ['Rivers', 'Bayelsa'], kind: 'polygon' },
  '6': { states: ['Federal Capital Territory'], kind: 'polygon' },
  '7': { states: ['Oyo'], kind: 'point', offset: [0.35, 0.09] },
  '8': { states: ['Ogun'], kind: 'point', offset: [0.12, -0.06] },
  '9': { states: ['Oyo'], kind: 'point', offset: [-0.3, 0.11] },
  '10': { states: ['Oyo'], kind: 'point', offset: [0.14, -0.19] },
  '11': { states: ['Oyo'], kind: 'point', offset: [-0.02, 0.02] },
  '12': { states: ['Oyo'], kind: 'point', offset: [-0.08, -0.21] },
  '13': { states: ['Kano'], kind: 'polygon' },
  '14': { states: ['Kaduna'], kind: 'polygon' },
  '15': { states: ['Kaduna'], kind: 'point', offset: [0.2, 0.05] },
  '15_2': { states: ['Kaduna'], kind: 'point', offset: [-0.15, -0.1] },
  '16': { states: ['Taraba'], kind: 'polygon' },
  '17': { states: ['Bauchi'], kind: 'polygon' },
  '18': { states: ['Bauchi'], kind: 'point', offset: [0.18, 0.06] },
  '19': { states: ['Bauchi'], kind: 'point', offset: [-0.22, -0.05] },
  '20': { states: ['Kogi'], kind: 'polygon' },
  '21': { states: ['Sokoto'], kind: 'polygon' },
  '22': { states: ['Abia'], kind: 'polygon' },
  '23': { states: ['Niger'], kind: 'polygon' },
  '24': { states: ['Benue'], kind: 'polygon' },
  '25': { states: ['Bayelsa'], kind: 'polygon' },
}

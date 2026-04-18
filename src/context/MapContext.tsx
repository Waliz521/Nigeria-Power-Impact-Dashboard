import { createContext, useContext } from 'react'
import type { PowerStatus } from '../types'

export interface MapFilters {
  /** State / merged-state polygon rows only — Excel `s/n` as string */
  territoryId: string
  /** City, LGA, and other marker rows only — Excel `s/n` as string */
  cityTerritoryId: string
  status: PowerStatus | ''
}

export interface MapContextValue {
  filters: MapFilters
  setFilters: (filters: MapFilters | ((prev: MapFilters) => MapFilters)) => void
}

export const MapContext = createContext<MapContextValue | null>(null)

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapContext.Provider')
  return ctx
}

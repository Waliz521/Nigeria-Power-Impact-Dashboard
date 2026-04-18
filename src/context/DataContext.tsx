import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { TerritoryRecord, TerritoriesPayload } from '../types'
import territoriesPayload from '../data/territoriesParsed.json'
import { TERRITORY_GEOMETRY } from '../data/territoryGeometryConfig'

const payload = territoriesPayload as TerritoriesPayload

export interface TerritoryFilterOption {
  id: string
  label: string
}

interface DataContextValue {
  territories: TerritoryRecord[]
  bySn: Map<number, TerritoryRecord>
  /** Polygon / state-level rows for the Territory filter */
  stateTerritoryFilterOptions: TerritoryFilterOption[]
  /** Point / city & sub-state rows for the Cities filter */
  cityTerritoryFilterOptions: TerritoryFilterOption[]
  meta: Pick<TerritoriesPayload, 'generatedAt' | 'sourceFile'>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const value = useMemo<DataContextValue>(() => {
    const { territories, generatedAt, sourceFile } = payload
    const bySn = new Map<number, TerritoryRecord>()
    const stateTerritoryFilterOptions: TerritoryFilterOption[] = []
    const cityTerritoryFilterOptions: TerritoryFilterOption[] = []

    for (const t of territories) {
      bySn.set(t.sn, t)
      const rule = TERRITORY_GEOMETRY[t.sn]
      if (!rule) continue
      const opt: TerritoryFilterOption = { id: String(t.sn), label: t.territoryLabel }
      if (rule.kind === 'polygon') stateTerritoryFilterOptions.push(opt)
      else cityTerritoryFilterOptions.push(opt)
    }

    stateTerritoryFilterOptions.sort((a, b) => Number(a.id) - Number(b.id))
    cityTerritoryFilterOptions.sort((a, b) => Number(a.id) - Number(b.id))

    return {
      territories,
      bySn,
      stateTerritoryFilterOptions,
      cityTerritoryFilterOptions,
      meta: { generatedAt, sourceFile },
    }
  }, [])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useTerritoryData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useTerritoryData must be used within DataProvider')
  return ctx
}

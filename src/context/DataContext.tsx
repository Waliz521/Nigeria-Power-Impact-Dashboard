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
  byId: Map<string, TerritoryRecord>
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
    const byId = new Map<string, TerritoryRecord>()
    const stateTerritoryFilterOptions: TerritoryFilterOption[] = []
    const cityTerritoryFilterOptions: TerritoryFilterOption[] = []

    for (const t of territories) {
      byId.set(t.id, t)
      const rule = TERRITORY_GEOMETRY[t.id]
      if (!rule) continue
      const opt: TerritoryFilterOption = { id: t.id, label: t.territoryLabel }
      if (rule.kind === 'polygon') stateTerritoryFilterOptions.push(opt)
      else cityTerritoryFilterOptions.push(opt)
    }

    function sortKey(id: string) {
      const [base, dup] = id.split('_')
      return Number(base) * 1000 + (dup ? Number(dup) : 0)
    }
    stateTerritoryFilterOptions.sort((a, b) => sortKey(a.id) - sortKey(b.id))
    cityTerritoryFilterOptions.sort((a, b) => sortKey(a.id) - sortKey(b.id))

    return {
      territories,
      byId,
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

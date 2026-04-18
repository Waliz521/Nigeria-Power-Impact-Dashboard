export type PowerStatus = 'stable' | 'warning' | 'critical'

export interface IssueRow {
  datetime: string
  description: string
}

export interface CustomDataEntry {
  key: string
  value: string
}

export interface TerritoryRecord {
  /** Unique key for filters/map (duplicate Excel s/n → "15_2", "15_3", …) */
  id: string
  sn: number
  territory: string
  territoryLabel: string
  developerNotes: string
  areas: string
  population: number
  households: number
  kpi: number
  energySources: string
  status: PowerStatus
  poGrid: string
  poSolar: string
  poOther: string
  impactCarbon: string
  impactRatio: string
  powerUsedDay1: number
  powerUsedDay2: number
  powerUsedDay3: number
  powerUsedDay4: number
  powerUsedDay5: number
  powerUsedDay6: number
  powerUsedDay7: number
  issues: IssueRow[]
  customData: CustomDataEntry[]
}

export interface TerritoriesPayload {
  generatedAt: string
  sourceSheet: string
  sourceFile: string
  territories: TerritoryRecord[]
}

import { useState } from 'react'
import { DataProvider } from './context/DataContext'
import { MapContext, type MapFilters } from './context/MapContext'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { Legend } from './components/Legend'
import { MapLayerToggles } from './components/MapLayerToggles'
import { TerritoryModal } from './components/TerritoryModal'
import type { TerritoryRecord } from './types'

const DEFAULT_MAP_FILTERS: MapFilters = {
  territoryId: '',
  cityTerritoryId: '',
  status: '',
}

function AppShell() {
  const [selected, setSelected] = useState<TerritoryRecord | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showPolygons, setShowPolygons] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [showWorldExcludeMask, setShowWorldExcludeMask] = useState(true)
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_MAP_FILTERS)

  return (
    <MapContext.Provider value={{ filters, setFilters }}>
    <div className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <Header />
      <main className="relative min-h-0 flex-1">
        <MapView
          showPolygons={showPolygons}
          showMarkers={showMarkers}
          showWorldExcludeMask={showWorldExcludeMask}
          onTerritorySelect={(t) => {
            setSelected(t)
            setModalOpen(true)
          }}
        />
        <div className="pointer-events-none absolute right-2 top-2 z-[1000] w-max max-w-[calc(100vw-1rem)] sm:right-4 sm:top-4">
          <div className="pointer-events-auto">
            <MapLayerToggles
              showPolygons={showPolygons}
              showMarkers={showMarkers}
              showWorldExcludeMask={showWorldExcludeMask}
              onPolygonsChange={setShowPolygons}
              onMarkersChange={setShowMarkers}
              onWorldExcludeMaskChange={setShowWorldExcludeMask}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 right-2 z-[1000] sm:right-4 sm:bottom-6">
          <div className="pointer-events-auto">
            <Legend />
          </div>
        </div>
      </main>
      <TerritoryModal territory={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
    </MapContext.Provider>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}

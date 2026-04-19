export interface MapLayerTogglesProps {
  showPolygons: boolean
  showMarkers: boolean
  showWorldExcludeMask: boolean
  onPolygonsChange: (v: boolean) => void
  onMarkersChange: (v: boolean) => void
  onWorldExcludeMaskChange: (v: boolean) => void
}

export function MapLayerToggles({
  showPolygons,
  showMarkers,
  showWorldExcludeMask,
  onPolygonsChange,
  onMarkersChange,
  onWorldExcludeMaskChange,
}: MapLayerTogglesProps) {
  return (
    <section
      className="w-fit max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm"
      aria-labelledby="map-layers-heading"
    >
      <h2
        id="map-layers-heading"
        className="mb-1.5 border-b border-gray-100 pb-1 font-semibold tracking-tight text-gray-700"
      >
        Map layers
      </h2>
      <label className="flex cursor-pointer items-center gap-2 py-0.5 text-gray-800">
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
          checked={showPolygons}
          onChange={(e) => onPolygonsChange(e.target.checked)}
        />
        State polygons
      </label>
      <label className="flex cursor-pointer items-center gap-2 py-0.5 text-gray-800">
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
          checked={showMarkers}
          onChange={(e) => onMarkersChange(e.target.checked)}
        />
        Substate points
      </label>
      <label className="flex cursor-pointer items-center gap-2 py-0.5 text-gray-800">
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
          checked={showWorldExcludeMask}
          onChange={(e) => onWorldExcludeMaskChange(e.target.checked)}
        />
        Dim outside Nigeria
      </label>
    </section>
  )
}

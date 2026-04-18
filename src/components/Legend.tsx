import { STATUS_COLORS, STATUS_LABELS } from '../data/statusColors'
import type { PowerStatus } from '../types'

const ORDER: PowerStatus[] = ['stable', 'warning', 'critical']

export function Legend() {
  return (
    <div className="w-fit max-w-[200px] rounded-lg border border-gray-200 bg-white/95 px-3 pb-3 pt-3 text-xs shadow-md backdrop-blur-sm">
      <p className="mb-2 border-b border-gray-100 pb-2 text-sm font-semibold leading-tight text-gray-900">
        Status
      </p>
      <ul className="space-y-1">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2 text-gray-700">
            <span
              className="h-3 w-3 shrink-0 rounded-sm border border-gray-700/30"
              style={{ backgroundColor: STATUS_COLORS[s] }}
            />
            {STATUS_LABELS[s]}
          </li>
        ))}
      </ul>
    </div>
  )
}

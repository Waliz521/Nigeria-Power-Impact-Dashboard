import type { PowerStatus } from '../types'

export const STATUS_COLORS: Record<PowerStatus, string> = {
  stable: '#16a34a',
  warning: '#d97706',
  critical: '#dc2626',
}

export const STATUS_LABELS: Record<PowerStatus, string> = {
  stable: 'Stable',
  warning: 'Warning',
  critical: 'Critical',
}

export function statusStyleColor(status: PowerStatus): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.warning
}

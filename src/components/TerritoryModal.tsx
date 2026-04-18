import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useRef, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TerritoryRecord } from '../types'
import { STATUS_COLORS, STATUS_LABELS } from '../data/statusColors'

function energySourceList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function chartData(t: TerritoryRecord) {
  return [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    day: `Day ${d}`,
    value: t[`powerUsedDay${d}` as keyof TerritoryRecord] as number,
  }))
}

function AlertIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

interface TerritoryModalProps {
  territory: TerritoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TerritoryModal({ territory, open, onOpenChange }: TerritoryModalProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) setDragOffset({ x: 0, y: 0 })
  }, [open])

  if (!territory) return null

  const sources = energySourceList(territory.energySources)
  const lineData = chartData(territory)
  const statusColor = STATUS_COLORS[territory.status]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/45" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[2001] max-h-[min(90dvh,720px)] w-[min(calc(100vw-1rem),520px)] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"
          style={{
            transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
          }}
        >
          <div
            ref={dragHandleRef}
            className="cursor-grab select-none active:cursor-grabbing"
            onPointerDown={(e) => {
              if (e.button !== 0) return
              dragHandleRef.current?.setPointerCapture(e.pointerId)
              dragRef.current = {
                px: e.clientX,
                py: e.clientY,
                ox: dragOffset.x,
                oy: dragOffset.y,
              }
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d) return
              setDragOffset({
                x: d.ox + (e.clientX - d.px),
                y: d.oy + (e.clientY - d.py),
              })
            }}
            onPointerUp={(e) => {
              dragRef.current = null
              try {
                dragHandleRef.current?.releasePointerCapture(e.pointerId)
              } catch {
                /* ignore */
              }
            }}
            onPointerCancel={() => {
              dragRef.current = null
            }}
          >
            <Dialog.Title className="pr-8 text-xl font-semibold text-gray-900">
              {territory.territoryLabel}
            </Dialog.Title>
          </div>
          <Dialog.Description className="sr-only">
            Power, demographics, and issues for this territory.
          </Dialog.Description>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: statusColor }}
            >
              {STATUS_LABELS[territory.status]}
            </span>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <section>
              <h3 className="font-medium text-gray-800">Energy sources</h3>
              {sources.length ? (
                <ul className="mt-1 list-inside list-disc text-gray-700">
                  {sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">—</p>
              )}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="font-medium text-gray-800">Population</h3>
                <p className="mt-1 text-gray-700">
                  {territory.population ? territory.population.toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Households</h3>
                <p className="mt-1 text-gray-700">
                  {territory.households ? territory.households.toLocaleString() : '—'}
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-medium text-gray-800">Areas covered</h3>
              <p className="mt-1 whitespace-pre-line text-gray-700">{territory.areas || '—'}</p>
            </section>

            <section>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-gray-800">KPI</h3>
                <span className="text-gray-600">{territory.kpi}%</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${territory.kpi}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
            </section>

            <section>
              <h3 className="font-medium text-gray-800">Power (last 7 days)</h3>
              <div className="mt-2 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={32} />
                    <ChartTooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={statusColor}
                      strokeWidth={2}
                      dot={{ r: 3, fill: statusColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h3 className="font-medium text-gray-800">Issues</h3>
              {territory.issues.length ? (
                <ul className="mt-2 space-y-2">
                  {territory.issues.map((issue, i) => (
                    <li key={`${issue.datetime}-${i}`} className="flex gap-2 text-gray-700">
                      <AlertIcon />
                      <div>
                        {issue.datetime ? (
                          <p className="text-xs font-medium text-amber-800">{issue.datetime}</p>
                        ) : null}
                        <p>{issue.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-gray-500">No issues recorded.</p>
              )}
            </section>

            <section>
              <h3 className="font-medium text-gray-800">Power output</h3>
              <dl className="mt-1 grid gap-1 text-gray-700 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-gray-500">Grid</dt>
                  <dd>{territory.poGrid || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Solar</dt>
                  <dd>{territory.poSolar || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Other</dt>
                  <dd>{territory.poOther || '—'}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="font-medium text-gray-800">Impact</h3>
              <dl className="mt-1 space-y-1 text-gray-700">
                <div>
                  <dt className="text-xs text-gray-500">Carbon avoided</dt>
                  <dd>{territory.impactCarbon || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Ratio (renewable : fossil)</dt>
                  <dd>{territory.impactRatio || '—'}</dd>
                </div>
              </dl>
            </section>

            {territory.customData.length ? (
              <section>
                <h3 className="font-medium text-gray-800">Additional data</h3>
                <ul className="mt-1 space-y-1 text-gray-700">
                  {territory.customData.map((e) => (
                    <li key={e.key}>
                      <span className="font-medium text-gray-600">{e.key}:</span> {e.value}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-200"
            >
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

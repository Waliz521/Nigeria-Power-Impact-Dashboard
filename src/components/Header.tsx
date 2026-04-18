import { useState, useMemo } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Dialog from '@radix-ui/react-dialog'
import { useMapContext } from '../context/MapContext'
import { useTerritoryData } from '../context/DataContext'
import { SearchableSelect } from './SearchableSelect'
import { BRANCH360_HOME, BRANCH360_LOGO_SRC, CONTACT_URL } from '../constants/site'
import { STATUS_LABELS } from '../data/statusColors'
import type { PowerStatus } from '../types'

const ALL_VALUE = '__all__'

const STATUS_OPTIONS: { value: PowerStatus | typeof ALL_VALUE; label: string }[] = [
  { value: ALL_VALUE, label: 'All statuses' },
  { value: 'stable', label: STATUS_LABELS.stable },
  { value: 'warning', label: STATUS_LABELS.warning },
  { value: 'critical', label: STATUS_LABELS.critical },
]

const triggerClass =
  'inline-flex min-h-9 min-w-0 w-full max-w-full items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 data-[placeholder]:text-gray-500 sm:w-max sm:max-w-[min(17rem,calc(100vw-2rem))] [&>span]:min-w-0 [&>span]:truncate'

const contentClass =
  'z-[3000] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-h-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg'

const itemClass =
  'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-900'

function ContactUsLink({
  className = '',
  lightSurface = false,
}: {
  className?: string
  /** Use in the mobile drawer (white background) */
  lightSurface?: boolean
}) {
  const surface = lightSurface
    ? 'border-emerald-600/35 bg-white text-emerald-800 hover:bg-emerald-50 hover:border-emerald-600/50 focus:ring-emerald-600/30'
    : 'border-slate-500/50 bg-slate-700/40 text-slate-100 hover:border-slate-400 hover:bg-slate-700 focus:ring-emerald-400/40'
  return (
    <a
      href={CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 ${surface} ${className}`}
    >
      Contact us
    </a>
  )
}

function FilterDropdowns({ compact = false }: { compact?: boolean }) {
  const { filters, setFilters } = useMapContext()
  const { stateTerritoryFilterOptions, cityTerritoryFilterOptions } = useTerritoryData()

  const territoryOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: 'All states' },
      ...stateTerritoryFilterOptions.map(({ id, label }) => ({ value: id, label })),
    ],
    [stateTerritoryFilterOptions],
  )

  const cityOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: 'All substates' },
      ...cityTerritoryFilterOptions.map(({ id, label }) => ({ value: id, label })),
    ],
    [cityTerritoryFilterOptions],
  )

  return (
    <div
      className={`flex min-w-0 flex-col gap-3 ${compact ? '' : 'sm:flex-row sm:flex-wrap sm:items-center'} sm:gap-x-3 sm:gap-y-2`}
    >
      <div className="flex w-full min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
        <span
          className={`shrink-0 text-sm font-medium ${compact ? 'text-slate-600' : 'text-slate-400'} ${compact ? 'block' : 'hidden sm:inline'}`}
        >
          Territory
        </span>
        <SearchableSelect
          wide
          value={filters.territoryId || ALL_VALUE}
          onValueChange={(v) => {
            const territoryId = v === ALL_VALUE ? '' : v
            setFilters((prev) => ({
              ...prev,
              territoryId,
              cityTerritoryId: territoryId ? '' : prev.cityTerritoryId,
            }))
          }}
          options={territoryOptions}
          placeholder="All states"
          searchPlaceholder="Search states..."
          ariaLabel="Filter by state or merged region"
        />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
        <span
          className={`shrink-0 text-sm font-medium ${compact ? 'text-slate-600' : 'text-slate-400'} ${compact ? 'block' : 'hidden sm:inline'}`}
        >
          Substates
        </span>
        <SearchableSelect
          value={filters.cityTerritoryId || ALL_VALUE}
          onValueChange={(v) => {
            const cityTerritoryId = v === ALL_VALUE ? '' : v
            setFilters((prev) => ({
              ...prev,
              cityTerritoryId,
              territoryId: cityTerritoryId ? '' : prev.territoryId,
            }))
          }}
          options={cityOptions}
          placeholder="All substates"
          searchPlaceholder="Search substates..."
          ariaLabel="Filter by substate or city area"
        />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
        <span
          className={`shrink-0 text-sm font-medium ${compact ? 'text-slate-600' : 'text-slate-400'} ${compact ? 'block' : 'hidden sm:inline'}`}
        >
          Status
        </span>
        <Select.Root
          value={filters.status || ALL_VALUE}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              status: (v === ALL_VALUE ? '' : v) as PowerStatus | '',
            }))
          }
        >
          <Select.Trigger className={triggerClass} aria-label="Filter by status">
            <Select.Value placeholder="All statuses" />
            <Select.Icon className="ml-auto shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={contentClass} position="popper" sideOffset={4}>
              <Select.Viewport>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <Select.Item key={value} value={value} className={itemClass}>
                    <Select.ItemText>{label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  )
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-slate-800 px-3 py-2 shadow-sm sm:px-4 sm:py-3 md:px-6">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 sm:gap-4">
        <a
          href={BRANCH360_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
        >
          <img
            src={BRANCH360_LOGO_SRC}
            alt="Branch360"
            width={140}
            height={36}
            className="h-7 w-auto max-w-[8rem] object-contain object-left sm:h-8 sm:max-w-[9.5rem]"
            decoding="async"
          />
        </a>
        <span className="hidden text-slate-500 sm:inline" aria-hidden>
          |
        </span>
        <h1 className="min-w-0 truncate text-sm font-medium text-slate-100 sm:text-base">
          Nigeria Power Impact Dashboard
        </h1>
      </div>

      <div className="hidden max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 md:flex">
        <ContactUsLink className="shrink-0" />
        <FilterDropdowns />
      </div>

      <div className="flex shrink-0 md:hidden">
        <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg p-2 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              aria-label="Open filters"
            >
              <HamburgerIcon />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/40" />
            <Dialog.Content className="fixed right-0 top-0 z-[2001] flex h-full w-full max-w-sm flex-col bg-white shadow-xl focus:outline-none">
              <Dialog.Title className="sr-only">Filters</Dialog.Title>
              <Dialog.Description className="sr-only">
                Territory, substates, and status filter options
              </Dialog.Description>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-lg font-semibold text-gray-900">Filters</span>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    aria-label="Close filters"
                  >
                    <CloseIcon />
                  </button>
                </Dialog.Close>
              </div>
              <div className="border-b border-gray-100 px-4 py-3">
                <ContactUsLink lightSurface className="w-full justify-center" />
              </div>
              <div className="flex-1 overflow-auto p-4">
                <FilterDropdowns compact />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}

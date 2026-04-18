/**
 * Searchable dropdown — same pattern as UK territories app (Popover + search).
 */
import * as Popover from '@radix-ui/react-popover'
import { useState, useMemo, useRef, useEffect } from 'react'

const triggerBaseClass =
  'inline-flex min-h-9 min-w-0 w-full max-w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 data-[placeholder]:text-gray-500 sm:w-max'

/**
 * Default: max width only (trigger still shrink-wraps to short labels — fine for substates).
 * Wide: min + max the same so the trigger is not sized to “All states” alone; otherwise the
 * popover’s `--radix-popover-trigger-width` stays too narrow to read territory names.
 */
const triggerWidthClass = {
  default: 'sm:max-w-[min(17rem,calc(100vw-2rem))]',
  wide: 'sm:min-w-[min(8rem,calc(100vw-2rem))] sm:max-w-[min(8rem,calc(100vw-2rem))]',
} as const

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  ariaLabel?: string
  className?: string
  /** Wider trigger + panel so long territory names fit on one line without horizontal scroll */
  wide?: boolean
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  ariaLabel,
  className = '',
  wide = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const q = search.trim().toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    )
  }, [options, search])

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  function handleSelect(v: string) {
    onValueChange(v)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={`${triggerBaseClass} ${wide ? triggerWidthClass.wide : triggerWidthClass.default} ${className}`}
        aria-label={ariaLabel}
      >
        <span
          className={`min-w-0 truncate text-left ${value ? 'text-gray-800' : 'text-gray-500'}`}
        >
          {selectedLabel}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="ml-auto shrink-0"
          aria-hidden
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[3000] w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] max-h-[320px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-gray-100 px-2 pb-2 pt-1">
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              autoComplete="off"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto overflow-x-hidden py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">No matches</div>
            ) : (
              filteredOptions.map(({ value: v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleSelect(v)}
                  className={`flex w-full min-w-0 cursor-pointer items-center px-3 py-2 text-left text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-900 focus:bg-emerald-50 focus:outline-none focus:ring-0 ${wide ? 'whitespace-nowrap' : ''}`}
                  style={
                    v === value
                      ? { backgroundColor: 'rgb(209 250 229)', fontWeight: 500 }
                      : undefined
                  }
                >
                  {label}
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

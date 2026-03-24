'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Team    { id: string; name: string }
interface Service { id: string; name: string }

interface DashboardFiltersProps {
  teams: Team[]
  services: Service[]
  isAdmin: boolean
}

export default function DashboardFilters({ teams, services, isAdmin }: DashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters =
    searchParams.has('from') ||
    searchParams.has('to') ||
    searchParams.has('team') ||
    searchParams.has('service')

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">From</label>
        <input
          type="date"
          defaultValue={searchParams.get('from') ?? ''}
          onChange={(e) => update('from', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">To</label>
        <input
          type="date"
          defaultValue={searchParams.get('to') ?? ''}
          onChange={(e) => update('to', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      {isAdmin && teams.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Team</label>
          <select
            defaultValue={searchParams.get('team') ?? ''}
            onChange={(e) => update('team', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {services.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Service</label>
          <select
            defaultValue={searchParams.get('service') ?? ''}
            onChange={(e) => update('service', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="self-end text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors pb-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

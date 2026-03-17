'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { Team, Service } from '@/lib/types'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/types'

interface QueueFiltersProps {
  teams: Team[]
  services: Service[]
}

export default function QueueFilters({ teams, services }: QueueFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''
  const currentTeam = searchParams.get('team') ?? ''
  const currentPriority = searchParams.get('priority') ?? ''
  const currentService = searchParams.get('service') ?? ''

  const hasFilters = currentStatus || currentTeam || currentPriority || currentService

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const selectClass =
    'block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status */}
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={currentPriority}
        onChange={(e) => updateFilter('priority', e.target.value)}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Team */}
      <select
        value={currentTeam}
        onChange={(e) => updateFilter('team', e.target.value)}
        className={selectClass}
      >
        <option value="">All Teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {/* Service */}
      <select
        value={currentService}
        onChange={(e) => updateFilter('service', e.target.value)}
        className={selectClass}
      >
        <option value="">All Services</option>
        {services.map((svc) => (
          <option key={svc.id} value={svc.id}>
            {svc.name}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-slate-500 hover:text-slate-800 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

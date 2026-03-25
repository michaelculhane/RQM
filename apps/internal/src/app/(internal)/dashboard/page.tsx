import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import KpiCard from '@/components/dashboard/KpiCard'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import type { Status } from '@/lib/types'

interface DashboardPageProps {
  searchParams: {
    from?: string
    to?: string
    team?: string
    service?: string
  }
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  open:             { label: 'Open',             color: 'text-brand-600',  bg: 'bg-brand-500' },
  in_progress:      { label: 'In Progress',      color: 'text-amber-600',  bg: 'bg-amber-500' },
  pending_employee: { label: 'Pending Employee', color: 'text-orange-600', bg: 'bg-orange-500' },
  resolved:         { label: 'Resolved',         color: 'text-green-600',  bg: 'bg-green-500' },
  closed:           { label: 'Closed',           color: 'text-gray-500',   bg: 'bg-gray-400' },
}

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-gray-500',  bg: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'text-brand-600', bg: 'bg-brand-400' },
  high:   { label: 'High',   color: 'text-orange-600',bg: 'bg-orange-400' },
  urgent: { label: 'Urgent', color: 'text-red-600',   bg: 'bg-red-500' },
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'hr_admin'
  const { from, to, team: teamFilter, service: serviceFilter } = searchParams

  // If service filter active, resolve task IDs from requests table
  let serviceTaskIds: string[] | null = null
  if (serviceFilter) {
    const { data: matching } = await supabase
      .from('requests')
      .select('id')
      .eq('service_id', serviceFilter)
    serviceTaskIds = matching?.map((r) => r.id) ?? []
  }

  // Fetch tasks (RLS scopes to team for agents, all for admins)
  let query = supabase
    .from('tasks')
    .select('id, status, priority, opened_at, requests!requests_task_fkey(service_id, services(id, name))')

  if (from) query = query.gte('opened_at', from)
  if (to)   query = query.lte('opened_at', to + 'T23:59:59')
  if (teamFilter) query = query.eq('team_id', teamFilter)
  if (serviceTaskIds !== null) {
    query = serviceTaskIds.length > 0
      ? query.in('id', serviceTaskIds)
      : query.in('id', ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: tasks } = await query

  const all = tasks ?? []
  const total = all.length

  // Counts
  const statusCounts: Record<string, number> = {}
  const priorityCounts: Record<string, number> = {}
  const serviceMap: Record<string, { name: string; count: number }> = {}

  for (const t of all) {
    statusCounts[t.status]   = (statusCounts[t.status] ?? 0) + 1
    priorityCounts[t.priority] = (priorityCounts[t.priority] ?? 0) + 1

    const r = Array.isArray(t.requests) ? t.requests[0] : t.requests
    const svc = Array.isArray(r?.services) ? r?.services[0] : r?.services
    if (svc?.id) {
      if (!serviceMap[svc.id]) serviceMap[svc.id] = { name: svc.name, count: 0 }
      serviceMap[svc.id].count++
    }
  }

  const serviceBreakdown = Object.values(serviceMap).sort((a, b) => b.count - a.count)

  // Fetch filter options
  const [{ data: allTeams }, { data: allServices }] = await Promise.all([
    supabase.from('teams').select('id, name').order('name'),
    supabase.from('services').select('id, name').order('name'),
  ])

  // Build drill-down href preserving current filters (minus status override)
  function queueHref(status?: Status) {
    const params = new URLSearchParams()
    if (status)     params.set('status', status)
    if (teamFilter) params.set('team', teamFilter)
    if (serviceFilter) params.set('service', serviceFilter)
    // Note: queue page doesn't yet support date range, so we omit from/to
    return `/queue?${params.toString()}`
  }

  const statuses = Object.keys(STATUS_CONFIG) as Status[]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of HR requests across your team.</p>
        </div>
        <Suspense fallback={null}>
          <DashboardFilters
            teams={allTeams ?? []}
            services={allServices ?? []}
            isAdmin={isAdmin}
          />
        </Suspense>
      </div>

      {/* KPI cards — status */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          By Status
          {total > 0 && <span className="ml-2 text-gray-300 normal-case font-normal">— {total} total</span>}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            label="All"
            count={total}
            href={queueHref()}
            colorClass="text-gray-900"
            bgClass="bg-gray-400"
          />
          {statuses.map((status) => {
            const cfg = STATUS_CONFIG[status]
            return (
              <KpiCard
                key={status}
                label={cfg.label}
                count={statusCounts[status] ?? 0}
                href={queueHref(status)}
                colorClass={cfg.color}
                bgClass={cfg.bg}
              />
            )
          })}
        </div>
      </div>

      {/* Status distribution bar */}
      {total > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Status Distribution
          </h2>
          <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
            {statuses.map((status) => {
              const count = statusCounts[status] ?? 0
              if (count === 0) return null
              const pct = (count / total) * 100
              return (
                <a
                  key={status}
                  href={queueHref(status)}
                  title={`${STATUS_CONFIG[status].label}: ${count}`}
                  style={{ width: `${pct}%` }}
                  className={`${STATUS_CONFIG[status].bg} hover:opacity-80 transition-opacity`}
                />
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {statuses.map((status) => {
              const count = statusCounts[status] ?? 0
              if (count === 0) return null
              const cfg = STATUS_CONFIG[status]
              return (
                <span key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                  {cfg.label} ({count})
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By service */}
        {serviceBreakdown.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              By Service
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <tbody className="divide-y divide-gray-100">
                  {serviceBreakdown.map((svc) => {
                    const pct = total > 0 ? (svc.count / total) * 100 : 0
                    return (
                      <tr key={svc.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 w-1/2">
                          {svc.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right w-12">
                          {svc.count}
                        </td>
                        <td className="px-4 py-3 w-1/3">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* By priority */}
        {total > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              By Priority
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <tbody className="divide-y divide-gray-100">
                  {(Object.keys(PRIORITY_CONFIG) as (keyof typeof PRIORITY_CONFIG)[])
                    .filter((p) => (priorityCounts[p] ?? 0) > 0)
                    .sort((a, b) => (priorityCounts[b] ?? 0) - (priorityCounts[a] ?? 0))
                    .map((priority) => {
                      const count = priorityCounts[priority] ?? 0
                      const pct = (count / total) * 100
                      const cfg = PRIORITY_CONFIG[priority]
                      return (
                        <tr key={priority} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm w-1/2">
                            <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right w-12">
                            {count}
                          </td>
                          <td className="px-4 py-3 w-1/3">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cfg.bg} rounded-full`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {total === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-400">No requests found for the selected filters.</p>
        </div>
      )}
    </div>
  )
}

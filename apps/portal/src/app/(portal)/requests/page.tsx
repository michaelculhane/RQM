import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RequestCard from '@/components/requests/RequestCard'
import type { Request, Status } from '@/lib/types'

interface RequestsPageProps {
  searchParams: {
    status?: string
    service?: string
    from?: string
    to?: string
  }
}

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_employee: 'Pending You',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { status, service: serviceFilter, from, to } = searchParams

  // Resolve service filter to task IDs if needed
  let serviceTaskIds: string[] | null = null
  if (serviceFilter) {
    const { data: matching } = await supabase
      .from('requests')
      .select('id')
      .eq('service_id', serviceFilter)
    serviceTaskIds = matching?.map((r) => r.id) ?? []
  }

  let query = supabase
    .from('tasks')
    .select('*, teams(*), requests!requests_task_fkey(service_id, services(*, teams(*)))')
    .eq('opened_by', user.id)
    .order('opened_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (from)   query = query.gte('opened_at', from)
  if (to)     query = query.lte('opened_at', to + 'T23:59:59')
  if (serviceTaskIds !== null) {
    query = serviceTaskIds.length > 0
      ? query.in('id', serviceTaskIds)
      : query.in('id', ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: tasks, error } = await query

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load requests. Please try again.
      </div>
    )
  }

  const typedRequests = (tasks ?? []).map((t) => {
    const r = Array.isArray(t.requests) ? t.requests[0] : t.requests
    return { ...t, service_id: r?.service_id, services: r?.services }
  }) as Request[]

  // Build a URL that drops a specific filter
  function withoutParam(key: string) {
    const params = new URLSearchParams()
    if (status && key !== 'status')   params.set('status', status)
    if (serviceFilter && key !== 'service') params.set('service', serviceFilter)
    if (from && key !== 'from')       params.set('from', from)
    if (to && key !== 'to')           params.set('to', to)
    const qs = params.toString()
    return `/requests${qs ? `?${qs}` : ''}`
  }

  const hasFilters = status || serviceFilter || from || to

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your submitted HR requests.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          New Request
        </Link>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Filtered by:</span>
          {status && (
            <a
              href={withoutParam('status')}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium px-2.5 py-1 hover:bg-brand-100 transition-colors"
            >
              Status: {STATUS_LABELS[status as Status] ?? status}
              <span className="ml-0.5 text-brand-400">×</span>
            </a>
          )}
          {from && (
            <a
              href={withoutParam('from')}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 hover:bg-gray-200 transition-colors"
            >
              From: {from}
              <span className="ml-0.5 text-gray-400">×</span>
            </a>
          )}
          {to && (
            <a
              href={withoutParam('to')}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 hover:bg-gray-200 transition-colors"
            >
              To: {to}
              <span className="ml-0.5 text-gray-400">×</span>
            </a>
          )}
          <a
            href="/requests"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
          >
            Clear all
          </a>
        </div>
      )}

      {typedRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            {hasFilters ? 'No matching requests' : 'No requests yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilters ? 'Try adjusting your filters.' : 'Get started by submitting a new HR request.'}
          </p>
          {!hasFilters && (
            <Link
              href="/services"
              className="mt-4 inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {typedRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

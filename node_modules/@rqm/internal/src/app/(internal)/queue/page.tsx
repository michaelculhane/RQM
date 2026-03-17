import { createClient } from '@/lib/supabase/server'
import QueueFilters from '@/components/queue/QueueFilters'
import RequestRow from '@/components/queue/RequestRow'
import type { Request, Team, Service } from '@/lib/types'

interface QueuePageProps {
  searchParams: {
    status?: string
    team?: string
    priority?: string
    service?: string
  }
}

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const supabase = createClient()

  // Build query
  let query = supabase
    .from('requests')
    .select(`
      *,
      services(*),
      teams(*),
      opener:profiles!requests_opened_by_fkey(*),
      assignee:profiles!requests_assigned_to_fkey(*)
    `)
    .order('opened_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.team) {
    query = query.eq('team_id', searchParams.team)
  }
  if (searchParams.priority) {
    query = query.eq('priority', searchParams.priority)
  }
  if (searchParams.service) {
    query = query.eq('service_id', searchParams.service)
  }

  const [{ data: requests }, { data: teams }, { data: services }] =
    await Promise.all([
      query,
      supabase.from('teams').select('*').order('name'),
      supabase.from('services').select('*').order('name'),
    ])

  const allRequests = (requests ?? []) as Request[]
  const allTeams = (teams ?? []) as Team[]
  const allServices = (services ?? []) as Service[]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          {allRequests.length} {allRequests.length === 1 ? 'request' : 'requests'}
          {searchParams.status || searchParams.team || searchParams.priority || searchParams.service
            ? ' matching current filters'
            : ' total'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <QueueFilters teams={allTeams} services={allServices} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {allRequests.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <svg
              className="mx-auto h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'ID',
                    'Service',
                    'Employee',
                    'Status',
                    'Priority',
                    'Team',
                    'Opened',
                    'Assigned To',
                    '',
                  ].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {allRequests.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

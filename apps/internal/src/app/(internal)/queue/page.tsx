import { createClient } from '@/lib/supabase/server'
import QueueFilters from '@/components/queue/QueueFilters'
import QueueTable from '@/components/queue/QueueTable'
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

  // Build query — task-level fields filtered directly; service filtered via requests table
  let taskIds: string[] | null = null
  if (searchParams.service) {
    const { data: matchingRequests } = await supabase
      .from('requests')
      .select('id')
      .eq('service_id', searchParams.service)
    taskIds = matchingRequests?.map((r) => r.id) ?? []
  }

  let query = supabase
    .from('tasks')
    .select(`
      *,
      teams(*),
      opener:profiles!tasks_opened_by_fkey(*),
      assignee:profiles!tasks_assigned_to_fkey(*),
      requests!requests_task_fkey(service_id, services(*))
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
  if (taskIds !== null) {
    query = taskIds.length > 0 ? query.in('id', taskIds) : query.in('id', ['00000000-0000-0000-0000-000000000000'])
  }

  const [{ data: tasks }, { data: teams }, { data: services }] =
    await Promise.all([
      query,
      supabase.from('teams').select('*').order('name'),
      supabase.from('services').select('*').order('name'),
    ])

  const allRequests = (tasks ?? []).map((t) => {
    const r = Array.isArray(t.requests) ? t.requests[0] : t.requests
    return { ...t, service_id: r?.service_id, services: r?.services }
  }) as Request[]
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
        <QueueTable requests={allRequests} />
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Request, Comment, Activity, Profile } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import StatusSelect from '@/components/requests/StatusSelect'
import PrioritySelect from '@/components/requests/PrioritySelect'
import AssignSelect from '@/components/requests/AssignSelect'
import CommentForm from '@/components/requests/CommentForm'
import ServiceFields from '@/components/requests/ServiceFields'
import ActivityTimeline from '@/components/requests/ActivityTimeline'
import { statusColor, statusLabel, priorityColor, priorityLabel, formatDate } from '@/lib/utils'

interface RequestPageProps {
  params: { id: string }
}

const childTableMap: Record<string, string> = {
  'hiring-request': 'requests_hiring',
  'benefits-inquiry': 'requests_benefits_inquiry',
  'system-access-request': 'requests_system_access',
  'change-of-address': 'requests_change_of_address',
  'direct-deposit-change': 'requests_direct_deposit',
}

export default async function RequestDetailPage({ params }: RequestPageProps) {
  const supabase = createClient()
  const { id } = params

  // 1. Fetch the main request with joins
  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      teams(*),
      opener:profiles!tasks_opened_by_fkey(*),
      assignee:profiles!tasks_assigned_to_fkey(*),
      requests!requests_task_fkey(service_id, services(*))
    `)
    .eq('id', id)
    .single()

  if (error || !task) {
    notFound()
  }

  const r = Array.isArray(task.requests) ? task.requests[0] : task.requests
  const request = { ...task, service_id: r?.service_id, services: r?.services }
  const req = request as Request

  // 2. Fetch child table data
  let serviceDetails: Record<string, unknown> | null = null
  const serviceSlug = req.services?.slug
  if (serviceSlug && childTableMap[serviceSlug]) {
    const { data: details } = await supabase
      .from(childTableMap[serviceSlug])
      .select('*')
      .eq('request_id', id)
      .single()
    serviceDetails = details as Record<string, unknown> | null
  }

  // 3. Comments (HR agents see all, including internal)
  const { data: commentsRaw } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(*)')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  // 4. Activity
  const { data: activityRaw } = await supabase
    .from('activity')
    .select('*, actor:profiles!activity_actor_id_fkey(*)')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  // 5. Agents on same team for assignment
  const { data: agentsRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('team_id', req.team_id)
    .in('role', ['hr_agent', 'hr_admin'])
    .order('full_name')

  const comments = (commentsRaw ?? []) as Comment[]
  const activity = (activityRaw ?? []) as Activity[]
  const agents = (agentsRaw ?? []) as Profile[]

  const shortId = id.slice(0, 8).toUpperCase()

  return (
    <div className="p-8">
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/queue"
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to queue
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left column (main content) */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {req.services?.name ?? 'Request'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 font-mono">#{shortId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor(req.status)}>
                  {statusLabel(req.status)}
                </Badge>
                <Badge className={priorityColor(req.priority)}>
                  {priorityLabel(req.priority)}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {req.description && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {req.description}
                </p>
              </div>
            )}
          </div>

          {/* Service-specific fields */}
          {serviceDetails && serviceSlug && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Request Details
              </h2>
              <ServiceFields
                serviceSlug={serviceSlug}
                details={serviceDetails}
              />
            </div>
          )}

          {/* Activity & Comments */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Activity
            </h2>
            <ActivityTimeline comments={comments} activity={activity} />
            <CommentForm requestId={id} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Actions card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </h2>
            <StatusSelect requestId={id} currentStatus={req.status} />
            <PrioritySelect requestId={id} currentPriority={req.priority} />
            <AssignSelect
              requestId={id}
              currentAssignee={req.assigned_to}
              agents={agents}
            />
          </div>

          {/* Metadata card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Details
            </h2>

            <div>
              <dt className="text-xs text-gray-500">Opened by</dt>
              <dd className="text-sm font-medium text-gray-800 mt-0.5">
                {req.opener?.full_name ?? '—'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Opened for</dt>
              <dd className="text-sm font-medium text-gray-800 mt-0.5">
                {req.opened_for ?? '—'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Submitted</dt>
              <dd className="text-sm text-gray-800 mt-0.5">
                {formatDate(req.opened_at)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Team</dt>
              <dd className="text-sm text-gray-800 mt-0.5">
                {req.teams?.name ?? '—'}
              </dd>
            </div>

            {req.closed_at && (
              <div>
                <dt className="text-xs text-gray-500">Closed</dt>
                <dd className="text-sm text-gray-800 mt-0.5">
                  {formatDate(req.closed_at)}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs text-gray-500">Service</dt>
              <dd className="text-sm text-gray-800 mt-0.5">
                {req.services?.name ?? '—'}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

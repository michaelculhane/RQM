import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import RequestTimeline from '@/components/requests/RequestTimeline'
import ReplyForm from '@/components/requests/ReplyForm'
import { statusLabel, statusColor, priorityColor, formatDate } from '@/lib/utils'
import type { Request, Comment, Activity } from '@/lib/types'

interface RequestDetailPageProps {
  params: { id: string }
}

// Map service slug to child table name and display labels
const CHILD_TABLE_MAP: Record<string, { table: string; label: string }> = {
  hiring: { table: 'request_hiring', label: 'Hiring Details' },
  benefits: { table: 'request_benefits', label: 'Benefits Details' },
  'system-access': { table: 'request_system_access', label: 'System Access Details' },
  'change-of-address': { table: 'request_address_change', label: 'Address Change Details' },
  'direct-deposit': { table: 'request_direct_deposit', label: 'Direct Deposit Details' },
}

function getChildTableInfo(slug: string) {
  if (CHILD_TABLE_MAP[slug]) return CHILD_TABLE_MAP[slug]
  if (slug.includes('hiring')) return CHILD_TABLE_MAP['hiring']
  if (slug.includes('benefit')) return CHILD_TABLE_MAP['benefits']
  if (slug.includes('access')) return CHILD_TABLE_MAP['system-access']
  if (slug.includes('address')) return CHILD_TABLE_MAP['change-of-address']
  if (slug.includes('deposit') || slug.includes('payroll')) return CHILD_TABLE_MAP['direct-deposit']
  return null
}

function FieldDisplay({ data }: { data: Record<string, unknown> }) {
  const skip = ['id', 'request_id', 'created_at', 'updated_at']
  const entries = Object.entries(data).filter(([k]) => !skip.includes(k))

  if (entries.length === 0) return null

  function formatKey(k: string): string {
    return k
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  function formatValue(v: unknown): string {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    return String(v)
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{formatKey(k)}</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{formatValue(v)}</dd>
        </div>
      ))}
    </dl>
  )
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch the request with related data
  const { data: request, error } = await supabase
    .from('requests')
    .select(`
      *,
      services(*, teams(*)),
      teams(*),
      opener:profiles!requests_opened_by_fkey(*),
      assignee:profiles!requests_assigned_to_fkey(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !request) {
    notFound()
  }

  const typedRequest = request as Request

  // Employees can only view their own requests
  if (typedRequest.opened_by !== user.id) {
    notFound()
  }

  // Fetch comments (public only for employee view)
  const { data: commentsRaw } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(*)')
    .eq('request_id', params.id)
    .eq('is_internal', false)
    .order('created_at', { ascending: true })

  // Fetch activity
  const { data: activityRaw } = await supabase
    .from('activity')
    .select('*, actor:profiles!activity_actor_id_fkey(*)')
    .eq('request_id', params.id)
    .order('created_at', { ascending: true })

  const comments = (commentsRaw ?? []) as Comment[]
  const activities = (activityRaw ?? []) as Activity[]

  // Fetch child table data if applicable
  let childData: Record<string, unknown> | null = null
  const serviceSlug = typedRequest.services?.slug
  if (serviceSlug) {
    const childInfo = getChildTableInfo(serviceSlug)
    if (childInfo) {
      const { data } = await supabase
        .from(childInfo.table)
        .select('*')
        .eq('request_id', params.id)
        .single()
      childData = data ?? null
    }
  }

  const childInfo = serviceSlug ? getChildTableInfo(serviceSlug) : null
  const canReply = !['closed', 'resolved'].includes(typedRequest.status)
  const shortId = typedRequest.id.replace(/-/g, '').slice(0, 8).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/requests" className="hover:text-gray-700">
          My Requests
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">#{shortId}</span>
      </nav>

      {/* Request Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {typedRequest.services?.name ?? 'Request'}
            </h1>
            <p className="mt-0.5 text-xs font-mono text-gray-400">#{shortId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColor(typedRequest.status)}>
              {statusLabel(typedRequest.status)}
            </Badge>
            <Badge className={priorityColor(typedRequest.priority)}>
              {typedRequest.priority.charAt(0).toUpperCase() + typedRequest.priority.slice(1)} Priority
            </Badge>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{formatDate(typedRequest.opened_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {typedRequest.services?.teams?.name ?? typedRequest.teams?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {typedRequest.assignee?.full_name ?? 'Unassigned'}
            </dd>
          </div>
          {typedRequest.closed_at && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Closed</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{formatDate(typedRequest.closed_at)}</dd>
            </div>
          )}
        </dl>

        {typedRequest.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {typedRequest.description}
            </p>
          </div>
        )}
      </div>

      {/* Child table / service-specific fields */}
      {childData && childInfo && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{childInfo.label}</h2>
          <FieldDisplay data={childData} />
        </div>
      )}

      {/* Timeline + Reply */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-6">Activity &amp; Comments</h2>

        <RequestTimeline
          requestId={params.id}
          initialComments={comments}
          initialActivity={activities}
        />

        {canReply && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <ReplyForm requestId={params.id} />
          </div>
        )}

        {!canReply && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400 text-center">
              This request is {typedRequest.status}. No further replies can be added.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

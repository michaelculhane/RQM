import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { RequestTask } from '@/lib/types'

const STATUS_STYLE: Record<string, string> = {
  open:      'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isDueSoon(due: string | null) {
  if (!due) return false
  const diff = new Date(due).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // within 3 days
}

function isOverdue(due: string | null) {
  if (!due) return false
  return new Date(due).getTime() < Date.now()
}

export default async function TasksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tasks } = await supabase
    .from('request_tasks')
    .select('*, requests(service_id, services(name, slug))')
    .eq('assigned_to', user.id)
    .eq('status', 'open')
    .order('due_date', { ascending: true, nullsFirst: false })

  const allTasks = (tasks ?? []) as RequestTask[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Action items assigned to you across your HR requests.
        </p>
      </div>

      {allTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-gray-900">No open tasks</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Request</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Service</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allTasks.map((task) => {
                const overdue = isOverdue(task.due_date)
                const dueSoon = !overdue && isDueSoon(task.due_date)
                const svc = Array.isArray(task.requests) ? task.requests[0] : task.requests
                const service = Array.isArray(svc?.services) ? svc?.services[0] : svc?.services
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-mono text-gray-500">{shortId(task.request_id)}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{service?.name ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${overdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : 'text-gray-600'}`}>
                        {overdue && <span className="mr-1">⚠</span>}
                        {formatDate(task.due_date)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[task.status] ?? STATUS_STYLE.open}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        Complete →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

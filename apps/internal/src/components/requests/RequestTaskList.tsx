'use client'
import { useState } from 'react'
import type { RequestTask } from '@/lib/types'
import { cancelRequestTask } from '@/actions/requestTasks'

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(due: string | null, status: string) {
  if (!due || status !== 'open') return false
  return new Date(due).getTime() < Date.now()
}

export default function RequestTaskList({
  tasks,
  requestId,
}: {
  tasks: RequestTask[]
  requestId: string
}) {
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel(taskId: string) {
    setCancelling(taskId)
    setError(null)
    const result = await cancelRequestTask(taskId, requestId)
    if (result?.error) setError(result.error)
    setCancelling(null)
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No tasks yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}
      {tasks.map((task) => {
        const overdue = isOverdue(task.due_date, task.status)
        return (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{task.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {task.assignee && (
                  <span>Assigned to <span className="font-medium text-gray-700">{task.assignee.full_name}</span></span>
                )}
                {task.form_templates && (
                  <span>Form: <span className="font-medium text-gray-700">{task.form_templates.name}</span></span>
                )}
                <span className={overdue ? 'text-red-600 font-medium' : ''}>
                  Due: {formatDate(task.due_date)}
                  {overdue && ' ⚠'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[task.status] ?? STATUS_STYLE.open}`}>
                {task.status}
              </span>
              {task.status === 'open' && (
                <button
                  onClick={() => handleCancel(task.id)}
                  disabled={cancelling === task.id}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Cancel task"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

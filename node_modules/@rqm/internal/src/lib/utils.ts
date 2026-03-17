import type { Status, Priority } from './types'

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function statusLabel(s: Status): string {
  const map: Record<Status, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    pending_employee: 'Pending Employee',
    resolved: 'Resolved',
    closed: 'Closed',
  }
  return map[s] ?? s
}

export function statusColor(s: Status): string {
  const map: Record<Status, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    pending_employee: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
  }
  return map[s] ?? 'bg-gray-100 text-gray-600'
}

export function priorityLabel(p: Priority): string {
  const map: Record<Priority, string> = {
    low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
  }
  return map[p] ?? p
}

export function priorityColor(p: Priority): string {
  const map: Record<Priority, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }
  return map[p] ?? 'bg-gray-100 text-gray-600'
}

export function activityLabel(type: string, metadata: Record<string, unknown> | null): string {
  switch (type) {
    case 'created': return 'Request created'
    case 'status_change': return `Status changed from ${metadata?.from} to ${metadata?.to}`
    case 'assignment': return metadata?.to ? `Assigned to ${metadata.to}` : 'Assignment removed'
    case 'priority_change': return `Priority changed from ${metadata?.from} to ${metadata?.to}`
    case 'comment_public': return 'Added a public comment'
    case 'comment_internal': return 'Added an internal note'
    default: return type
  }
}

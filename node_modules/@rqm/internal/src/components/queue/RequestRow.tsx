import Link from 'next/link'
import type { Request } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { statusColor, statusLabel, priorityColor, priorityLabel, formatDate } from '@/lib/utils'

interface RequestRowProps {
  request: Request
}

export default function RequestRow({ request }: RequestRowProps) {
  const shortId = request.id.slice(0, 8).toUpperCase()

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* ID */}
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <Link
          href={`/requests/${request.id}`}
          className="font-mono text-slate-600 hover:text-slate-900 font-medium"
        >
          #{shortId}
        </Link>
      </td>

      {/* Service */}
      <td className="px-4 py-3 text-sm text-gray-700">
        <Link href={`/requests/${request.id}`} className="hover:text-gray-900">
          {request.services?.name ?? '—'}
        </Link>
      </td>

      {/* Employee (Opened For) */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {request.opener?.full_name ?? '—'}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge className={statusColor(request.status)}>
          {statusLabel(request.status)}
        </Badge>
      </td>

      {/* Priority */}
      <td className="px-4 py-3">
        <Badge className={priorityColor(request.priority)}>
          {priorityLabel(request.priority)}
        </Badge>
      </td>

      {/* Team */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {request.teams?.name ?? '—'}
      </td>

      {/* Opened Date */}
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {formatDate(request.opened_at)}
      </td>

      {/* Assigned To */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {request.assignee?.full_name ?? (
          <span className="text-gray-400 italic">Unassigned</span>
        )}
      </td>

      {/* View link */}
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/requests/${request.id}`}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          View
        </Link>
      </td>
    </tr>
  )
}

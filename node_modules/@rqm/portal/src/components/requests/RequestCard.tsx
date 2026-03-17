import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { statusLabel, statusColor, priorityColor, formatDate } from '@/lib/utils'
import type { Request } from '@/lib/types'

interface RequestCardProps {
  request: Request
}

export default function RequestCard({ request }: RequestCardProps) {
  const shortId = request.id.replace(/-/g, '').slice(0, 8).toUpperCase()

  return (
    <Link
      href={`/requests/${request.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">#{shortId}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
            {request.services?.name ?? 'Request'}
          </h3>
          {request.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {request.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge className={statusColor(request.status)}>
            {statusLabel(request.status)}
          </Badge>
          <Badge className={priorityColor(request.priority)}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {request.teams?.name ?? '—'}
        </span>
        <span className="text-xs text-gray-400">
          {formatDate(request.opened_at)}
        </span>
      </div>
    </Link>
  )
}

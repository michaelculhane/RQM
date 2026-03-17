import type { Comment, Activity } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { formatDate, activityLabel } from '@/lib/utils'

interface ActivityTimelineProps {
  comments: Comment[]
  activity: Activity[]
}

type TimelineItem =
  | { kind: 'comment'; data: Comment; sortKey: string }
  | { kind: 'activity'; data: Activity; sortKey: string }

export default function ActivityTimeline({ comments, activity }: ActivityTimelineProps) {
  const items: TimelineItem[] = [
    ...comments.map((c) => ({
      kind: 'comment' as const,
      data: c,
      sortKey: c.created_at,
    })),
    ...activity.map((a) => ({
      kind: 'activity' as const,
      data: a,
      sortKey: a.created_at,
    })),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4">
        No activity yet.
      </p>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          if (item.kind === 'comment') {
            const comment = item.data
            return (
              <li key={`comment-${comment.id}`}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start gap-3">
                    {/* Avatar dot */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-white ${
                        comment.is_internal
                          ? 'bg-amber-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-600">
                        {comment.author?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`rounded-lg border px-4 py-3 ${
                          comment.is_internal
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">
                            {comment.author?.full_name ?? 'Unknown'}
                          </span>
                          {comment.is_internal && (
                            <Badge className="bg-amber-100 text-amber-700">
                              Internal Note
                            </Badge>
                          )}
                          <span className="ml-auto text-xs text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          }

          // activity item
          const act = item.data
          return (
            <li key={`activity-${act.id}`}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-center gap-3">
                  {/* Icon dot */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white">
                    <svg
                      className="w-3.5 h-3.5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      {act.actor?.full_name && (
                        <span className="font-medium text-gray-800">
                          {act.actor.full_name}{' '}
                        </span>
                      )}
                      {activityLabel(act.type, act.metadata)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(act.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

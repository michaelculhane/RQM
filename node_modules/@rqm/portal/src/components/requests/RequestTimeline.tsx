'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Comment, Activity } from '@/lib/types'

interface TimelineItem {
  id: string
  type: 'comment' | 'activity'
  created_at: string
  data: Comment | Activity
}

interface RequestTimelineProps {
  requestId: string
  initialComments: Comment[]
  initialActivity: Activity[]
}

function activityDescription(activity: Activity): string {
  const meta = activity.metadata ?? {}
  switch (activity.type) {
    case 'created':
      return 'Request created'
    case 'status_changed':
      return `Status changed from ${meta.from ?? '—'} to ${meta.to ?? '—'}`
    case 'assigned':
      return meta.assignee
        ? `Assigned to ${meta.assignee}`
        : 'Assignment removed'
    case 'priority_changed':
      return `Priority changed from ${meta.from ?? '—'} to ${meta.to ?? '—'}`
    case 'comment_added':
      return 'Comment added'
    default:
      return activity.type.replace(/_/g, ' ')
  }
}

export default function RequestTimeline({
  requestId,
  initialComments,
  initialActivity,
}: RequestTimelineProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [activities, setActivities] = useState<Activity[]>(initialActivity)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new comments
    const commentSub = supabase
      .channel(`comments:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev
            return [...prev, newComment]
          })
        }
      )
      .subscribe()

    // Subscribe to new activity
    const activitySub = supabase
      .channel(`activity:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const newActivity = payload.new as Activity
          setActivities((prev) => {
            if (prev.some((a) => a.id === newActivity.id)) return prev
            return [...prev, newActivity]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(commentSub)
      supabase.removeChannel(activitySub)
    }
  }, [requestId])

  // Merge and sort
  const items: TimelineItem[] = [
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      type: 'comment' as const,
      created_at: c.created_at,
      data: c,
    })),
    ...activities.map((a) => ({
      id: `activity-${a.id}`,
      type: 'activity' as const,
      created_at: a.created_at,
      data: a,
    })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          if (item.type === 'comment') {
            const comment = item.data as Comment
            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  )}
                  <div className="relative flex gap-3">
                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {(comment.author?.full_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author?.full_name ?? 'User'}
                          </span>
                          <div className="flex items-center gap-2">
                            {comment.is_internal && (
                              <span className="text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">
                                Internal
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          }

          // Activity item
          const activity = item.data as Activity
          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span className="absolute left-4 top-6 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                )}
                <div className="relative flex gap-3 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        {activity.actor?.full_name ?? 'System'}
                      </span>{' '}
                      {activityDescription(activity)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(activity.created_at)}</p>
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

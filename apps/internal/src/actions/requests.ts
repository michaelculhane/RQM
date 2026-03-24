'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStatus(requestId: string, newStatus: string, oldStatus: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'closed' || newStatus === 'resolved') {
    updates.closed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', requestId)
  if (error) return { error: error.message }

  await supabase.from('activity').insert({
    request_id: requestId,
    actor_id: user.id,
    type: 'status_change',
    metadata: { from: oldStatus, to: newStatus },
  })

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/queue')
  return { success: true }
}

export async function updatePriority(requestId: string, newPriority: string, oldPriority: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tasks')
    .update({ priority: newPriority })
    .eq('id', requestId)
  if (error) return { error: error.message }

  await supabase.from('activity').insert({
    request_id: requestId,
    actor_id: user.id,
    type: 'priority_change',
    metadata: { from: oldPriority, to: newPriority },
  })

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/queue')
  return { success: true }
}

export async function assignRequest(requestId: string, assigneeId: string | null, assigneeName: string | null) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tasks')
    .update({ assigned_to: assigneeId })
    .eq('id', requestId)
  if (error) return { error: error.message }

  await supabase.from('activity').insert({
    request_id: requestId,
    actor_id: user.id,
    type: 'assignment',
    metadata: { to: assigneeName },
  })

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/queue')
  return { success: true }
}

export async function addComment(requestId: string, body: string, isInternal: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('comments')
    .insert({ request_id: requestId, author_id: user.id, body, is_internal: isInternal })
  if (error) return { error: error.message }

  await supabase.from('activity').insert({
    request_id: requestId,
    actor_id: user.id,
    type: isInternal ? 'comment_internal' : 'comment_public',
  })

  revalidatePath(`/requests/${requestId}`)
  return { success: true }
}

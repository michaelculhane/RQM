'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRequestTask(data: {
  requestId: string
  title: string
  formTemplateId: string | null
  assignedTo: string | null
  dueDate: string | null
}) {
  const supabase = createClient()
  const { error } = await supabase.from('request_tasks').insert({
    request_id: data.requestId,
    title: data.title.trim(),
    form_template_id: data.formTemplateId || null,
    assigned_to: data.assignedTo || null,
    due_date: data.dueDate || null,
    status: 'open',
  })
  if (error) return { error: error.message }
  revalidatePath(`/requests/${data.requestId}`)
  return { success: true }
}

export async function cancelRequestTask(taskId: string, requestId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('request_tasks')
    .update({ status: 'cancelled' })
    .eq('id', taskId)
  if (error) return { error: error.message }
  revalidatePath(`/requests/${requestId}`)
  return { success: true }
}

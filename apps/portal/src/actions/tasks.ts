'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitTask(taskId: string, formValues: Record<string, string>) {
  const supabase = createClient()
  const { error } = await supabase.rpc('submit_request_task', {
    p_task_id: taskId,
    p_form_values: formValues,
  })
  if (error) return { error: error.message }
  revalidatePath('/tasks')
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

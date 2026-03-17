'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitRequest(
  serviceSlug: string,
  description: string,
  fields: Record<string, string>
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_request', {
    p_service_slug: serviceSlug,
    p_description: description,
    p_fields: fields,
  })
  if (error) return { error: error.message }
  revalidatePath('/requests')
  redirect('/requests')
}

export async function addReply(requestId: string, body: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('comments')
    .insert({ request_id: requestId, author_id: user.id, body, is_internal: false })
  if (error) return { error: error.message }
  revalidatePath(`/requests/${requestId}`)
  return { success: true }
}

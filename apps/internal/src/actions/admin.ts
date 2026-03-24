'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleService(serviceId: string, enabled: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .update({ enabled })
    .eq('id', serviceId)
  if (error) return { error: error.message }
  revalidatePath('/admin/services')
  return { success: true }
}

export async function updateUserRole(userId: string, role: string, teamId: string | null) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role, team_id: teamId })
    .eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}


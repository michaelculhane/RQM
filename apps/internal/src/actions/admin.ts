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

export async function createCategory(name: string) {
  const supabase = createClient()
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { data: last } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const sort_order = (last?.sort_order ?? 0) + 1
  const { error } = await supabase.from('categories').insert({ name: name.trim(), slug, sort_order })
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateServiceCategory(serviceId: string, categoryId: string | null) {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .update({ category_id: categoryId })
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


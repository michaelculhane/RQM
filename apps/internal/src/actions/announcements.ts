'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(data: {
  title: string
  body: string
  image_url: string
  color_theme: string
  cta_label: string
  cta_url: string
}) {
  const supabase = createClient()
  const { data: last } = await supabase
    .from('announcements')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()
  const sort_order = (last?.sort_order ?? 0) + 1
  const { error } = await supabase.from('announcements').insert({
    title: data.title.trim(),
    body: data.body.trim() || null,
    image_url: data.image_url.trim() || null,
    color_theme: data.color_theme || 'blue',
    cta_label: data.cta_label.trim() || null,
    cta_url: data.cta_url.trim() || null,
    sort_order,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function updateAnnouncement(id: string, data: {
  title: string
  body: string
  image_url: string
  color_theme: string
  cta_label: string
  cta_url: string
  is_active: boolean
}) {
  const supabase = createClient()
  const { error } = await supabase.from('announcements').update({
    title: data.title.trim(),
    body: data.body.trim() || null,
    image_url: data.image_url.trim() || null,
    color_theme: data.color_theme || 'blue',
    cta_label: data.cta_label.trim() || null,
    cta_url: data.cta_url.trim() || null,
    is_active: data.is_active,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/announcements')
  return { success: true }
}

export async function toggleAnnouncement(id: string, is_active: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('announcements').update({ is_active }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/announcements')
  return { success: true }
}

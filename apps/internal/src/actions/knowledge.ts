'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `${base}-${Date.now()}`
}

export async function createArticle(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const category = (formData.get('category') as string) || null
  const action = formData.get('action') as string // 'draft' or 'publish'

  const status = action === 'publish' ? 'published' : 'draft'
  const slug = generateSlug(title)

  const { data, error } = await supabase
    .from('knowledge_articles')
    .insert({
      title,
      slug,
      body,
      category,
      status,
      author_id: user.id,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/knowledge')
  redirect(`/knowledge/${data.id}/edit`)
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const category = (formData.get('category') as string) || null
  const action = formData.get('action') as string

  // Fetch current status
  const { data: current } = await supabase
    .from('knowledge_articles')
    .select('status, published_at')
    .eq('id', id)
    .single()

  let status = current?.status ?? 'draft'
  let published_at = current?.published_at ?? null

  if (action === 'publish' && status !== 'published') {
    status = 'published'
    published_at = new Date().toISOString()
  } else if (action === 'retire') {
    status = 'retired'
  } else if (action === 'reactivate') {
    status = 'draft'
  }

  const { error } = await supabase
    .from('knowledge_articles')
    .update({ title, body, category, status, published_at })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/knowledge')
  revalidatePath(`/knowledge/${id}/edit`)
  return { success: true }
}

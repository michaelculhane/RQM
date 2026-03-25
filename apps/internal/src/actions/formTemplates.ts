'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFormTemplate(name: string, description: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('form_templates')
    .insert({ name: name.trim(), description: description.trim() || null, created_by: user?.id })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin/form-templates')
  return { id: data.id }
}

export async function updateFormTemplate(id: string, name: string, description: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('form_templates')
    .update({ name: name.trim(), description: description.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/form-templates/${id}`)
  return { success: true }
}

export async function toggleFormTemplateActive(id: string, is_active: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('form_templates')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/form-templates/${id}`)
  return { success: true }
}

export async function deleteFormTemplate(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('form_templates').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/form-templates')
  return { success: true }
}

export async function addFormTemplateField(
  formTemplateId: string,
  data: {
    field_name: string
    label: string
    field_type: string
    options: string[] | null
    is_required: boolean
    is_pii: boolean
    request_field_mapping: object | null
  }
) {
  const supabase = createClient()
  const { data: last } = await supabase
    .from('form_template_fields')
    .select('display_order')
    .eq('form_template_id', formTemplateId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()
  const display_order = (last?.display_order ?? -1) + 1
  const { error } = await supabase
    .from('form_template_fields')
    .insert({ ...data, form_template_id: formTemplateId, display_order })
  if (error) return { error: error.message }
  revalidatePath(`/admin/form-templates/${formTemplateId}`)
  return { success: true }
}

export async function updateFormTemplateField(
  id: string,
  formTemplateId: string,
  data: {
    field_name: string
    label: string
    field_type: string
    options: string[] | null
    is_required: boolean
    is_pii: boolean
    request_field_mapping: object | null
  }
) {
  const supabase = createClient()
  const { error } = await supabase.from('form_template_fields').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/form-templates/${formTemplateId}`)
  return { success: true }
}

export async function deleteFormTemplateField(id: string, formTemplateId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('form_template_fields').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/form-templates/${formTemplateId}`)
  return { success: true }
}

export async function moveFormTemplateField(id: string, formTemplateId: string, direction: 'up' | 'down') {
  const supabase = createClient()
  const { data: fields } = await supabase
    .from('form_template_fields')
    .select('id, display_order')
    .eq('form_template_id', formTemplateId)
    .order('display_order')
  if (!fields) return { error: 'Could not load fields' }

  const idx = fields.findIndex((f) => f.id === id)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= fields.length) return { success: true }

  const a = fields[idx]
  const b = fields[swapIdx]
  await supabase.from('form_template_fields').update({ display_order: b.display_order }).eq('id', a.id)
  await supabase.from('form_template_fields').update({ display_order: a.display_order }).eq('id', b.id)

  revalidatePath(`/admin/form-templates/${formTemplateId}`)
  return { success: true }
}

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FormTemplateEditor from '@/components/admin/FormTemplateEditor'
import FormTemplateFieldList from '@/components/admin/FormTemplateFieldList'
import AddFormTemplateFieldForm from '@/components/admin/AddFormTemplateFieldForm'
import type { FormTemplate, FormTemplateField } from '@/lib/types'

export default async function FormTemplateDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'hr_admin') redirect('/admin/form-templates')

  const { data: template } = await supabase
    .from('form_templates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!template) notFound()

  const { data: fields } = await supabase
    .from('form_template_fields')
    .select('*')
    .eq('form_template_id', params.id)
    .order('display_order')

  const t = template as FormTemplate
  const allFields = (fields ?? []) as FormTemplateField[]

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/form-templates" className="hover:text-gray-700">Form Templates</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t.name}</span>
      </nav>

      <div className="space-y-6">
        {/* Template metadata editor */}
        <FormTemplateEditor template={t} />

        {/* Fields */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Fields</h2>
          <FormTemplateFieldList fields={allFields} formTemplateId={t.id} />
          <div className="mt-4">
            <AddFormTemplateFieldForm formTemplateId={t.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

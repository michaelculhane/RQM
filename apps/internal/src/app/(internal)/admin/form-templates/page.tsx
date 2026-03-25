import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CreateFormTemplateForm from '@/components/admin/CreateFormTemplateForm'
import type { FormTemplate } from '@/lib/types'

export default async function FormTemplatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'hr_admin') {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 max-w-md">
          <h1 className="text-base font-semibold text-red-800">Access Denied</h1>
          <p className="mt-1 text-sm text-red-600">Admin access is required.</p>
        </div>
      </div>
    )
  }

  const { data: templates } = await supabase
    .from('form_templates')
    .select('*, form_template_fields(id)')
    .order('updated_at', { ascending: false })

  const allTemplates = (templates ?? []) as (FormTemplate & { form_template_fields: { id: string }[] })[]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define reusable field sets for request task forms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template list */}
        <div className="lg:col-span-2 space-y-3">
          {allTemplates.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-10 text-center">
              <p className="text-sm text-gray-400">No templates yet. Create one to get started.</p>
            </div>
          ) : (
            allTemplates.map((t) => (
              <Link
                key={t.id}
                href={`/admin/form-templates/${t.id}`}
                className="group block bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                        {t.name}
                      </p>
                      {!t.is_active && (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                          Inactive
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="mt-0.5 text-sm text-gray-500 truncate">{t.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      {t.form_template_fields.length}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.form_template_fields.length === 1 ? 'field' : 'fields'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Create form */}
        <div>
          <CreateFormTemplateForm />
        </div>
      </div>
    </div>
  )
}

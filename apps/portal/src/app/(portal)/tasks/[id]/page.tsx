import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import TaskForm from '@/components/tasks/TaskForm'
import type { RequestTask } from '@/lib/types'

export default async function TaskPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('request_tasks')
    .select(`
      *,
      requests(service_id, services(name, slug)),
      form_templates(*, form_template_fields(*))
    `)
    .eq('id', params.id)
    .eq('assigned_to', user.id)
    .single()

  if (!task) notFound()

  const t = task as RequestTask & {
    form_templates: NonNullable<RequestTask['form_templates']> | null
    requests: { services?: { name: string; slug: string } } | null
  }

  const svc = Array.isArray(t.requests) ? (t.requests as any)[0] : t.requests
  const service = Array.isArray(svc?.services) ? svc?.services[0] : svc?.services

  // Sort fields by display_order
  const template = t.form_templates ?? null
  if (template?.form_template_fields) {
    template.form_template_fields = [...template.form_template_fields].sort(
      (a, b) => a.display_order - b.display_order
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/tasks" className="hover:text-gray-700">My Tasks</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t.title}</span>
      </nav>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            {service && (
              <p className="mt-1 text-sm text-gray-500">{service.name}</p>
            )}
          </div>
          {t.due_date && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Due</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {t.status !== 'open' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-green-800">This task has already been {t.status}.</p>
          <Link href="/tasks" className="mt-3 inline-flex text-sm text-green-700 hover:text-green-900 font-medium">
            ← Back to My Tasks
          </Link>
        </div>
      ) : (
        <TaskForm task={t} template={template} />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitTask } from '@/actions/tasks'
import type { RequestTask, FormTemplate, FormTemplateField } from '@/lib/types'

interface TaskFormProps {
  task: RequestTask
  template: FormTemplate | null
}

export default function TaskForm({ task, template }: TaskFormProps) {
  const router = useRouter()
  const fields = template?.form_template_fields ?? []
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.field_name, '']))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setValue(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await submitTask(task.id, values)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push('/tasks?submitted=1')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No additional fields required. Submit to complete this task.
          </p>
        ) : (
          fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.field_name] ?? ''}
              onChange={(v) => setValue(field.field_name, v)}
            />
          ))
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting…' : 'Submit & Complete Task'}
        </button>
      </div>
    </form>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormTemplateField
  value: string
  onChange: (v: string) => void
}) {
  const baseInput = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.is_required && <span className="ml-1 text-red-500">*</span>}
        {field.is_pii && (
          <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
            PII — kept confidential
          </span>
        )}
      </label>

      {field.field_type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.is_required}
          className={baseInput}
        />
      )}

      {field.field_type === 'textarea' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.is_required}
          rows={3}
          className={`${baseInput} resize-none`}
        />
      )}

      {field.field_type === 'date' && (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.is_required}
          className={baseInput}
        />
      )}

      {field.field_type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.is_required}
          className={baseInput}
        >
          <option value="">Select an option…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.field_type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      )}

      {field.field_type === 'file' && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          File uploads are not yet available online. Please describe the document you are providing below, and your HR agent will follow up with submission instructions.
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
            rows={2}
            placeholder="Describe the document…"
            className={`${baseInput} mt-2 resize-none`}
          />
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addFormTemplateField } from '@/actions/formTemplates'
import { FieldFormFields } from './FormTemplateFieldList'
import type { FormFieldType } from '@/lib/types'

const EMPTY = {
  field_name: '',
  label: '',
  field_type: 'text' as string,
  options_raw: '',
  is_required: false,
  is_pii: false,
  mapping_raw: '',
}

export default function AddFormTemplateFieldForm({ formTemplateId }: { formTemplateId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    let mapping = null
    if (values.mapping_raw.trim()) {
      try { mapping = JSON.parse(values.mapping_raw) } catch { setError('Field mapping is not valid JSON'); setLoading(false); return }
    }
    const options = values.field_type === 'select' && values.options_raw.trim()
      ? values.options_raw.split(',').map((s) => s.trim()).filter(Boolean)
      : null
    const result = await addFormTemplateField(formTemplateId, {
      field_name: values.field_name.trim(),
      label: values.label.trim(),
      field_type: values.field_type as FormFieldType,
      options,
      is_required: values.is_required,
      is_pii: values.is_pii,
      request_field_mapping: mapping,
    })
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setValues(EMPTY)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Field
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-brand-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Add Field</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FieldFormFields values={values} set={set} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || !values.label.trim() || !values.field_name.trim()}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding…' : 'Add Field'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setValues(EMPTY); setError(null) }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

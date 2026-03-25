'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormTemplateField, FormFieldType } from '@/lib/types'
import { deleteFormTemplateField, moveFormTemplateField, updateFormTemplateField } from '@/actions/formTemplates'

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Text',
  textarea: 'Textarea',
  date: 'Date',
  select: 'Select',
  checkbox: 'Checkbox',
  file: 'File',
}

interface Props {
  fields: FormTemplateField[]
  formTemplateId: string
}

export default function FormTemplateFieldList({ fields: initialFields, formTemplateId }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState(initialFields)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setWorking(id)
    const result = await deleteFormTemplateField(id, formTemplateId)
    if (result?.error) {
      setError(result.error)
    } else {
      setFields((prev) => prev.filter((f) => f.id !== id))
    }
    setWorking(null)
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    setWorking(id + direction)
    await moveFormTemplateField(id, formTemplateId, direction)
    setWorking(null)
    router.refresh()
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No fields yet. Add one below.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {error && <div className="px-5 py-2 bg-red-50 border-b border-red-100 text-sm text-red-600">{error}</div>}
      <ul className="divide-y divide-gray-100">
        {fields.map((field, idx) => (
          <li key={field.id}>
            {editingId === field.id ? (
              <FieldEditRow
                field={field}
                formTemplateId={formTemplateId}
                onSave={(updated) => {
                  setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => handleMove(field.id, 'up')}
                    disabled={idx === 0 || !!working}
                    className="text-gray-300 hover:text-gray-500 disabled:opacity-20"
                    title="Move up"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMove(field.id, 'down')}
                    disabled={idx === fields.length - 1 || !!working}
                    className="text-gray-300 hover:text-gray-500 disabled:opacity-20"
                    title="Move down"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Field info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{field.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{field.field_name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                      {FIELD_TYPE_LABELS[field.field_type]}
                    </span>
                    {field.is_required && (
                      <span className="text-xs bg-red-50 text-red-600 rounded px-1.5 py-0.5">Required</span>
                    )}
                    {field.is_pii && (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">PII</span>
                    )}
                    {field.request_field_mapping && (
                      <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">
                        → {field.request_field_mapping.target_field}
                      </span>
                    )}
                  </div>
                  {field.options && field.options.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">Options: {field.options.join(', ')}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => setEditingId(field.id)}
                    className="text-sm text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    disabled={working === field.id}
                    className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                  >
                    {working === field.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FieldEditRow({
  field,
  formTemplateId,
  onSave,
  onCancel,
}: {
  field: FormTemplateField
  formTemplateId: string
  onSave: (updated: FormTemplateField) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState({
    field_name: field.field_name,
    label: field.label,
    field_type: field.field_type as string,
    options_raw: field.options?.join(', ') ?? '',
    is_required: field.is_required,
    is_pii: field.is_pii,
    mapping_raw: field.request_field_mapping
      ? JSON.stringify(field.request_field_mapping, null, 2)
      : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    let mapping = null
    if (values.mapping_raw.trim()) {
      try { mapping = JSON.parse(values.mapping_raw) } catch { setError('Field mapping is not valid JSON'); setSaving(false); return }
    }
    const options = values.field_type === 'select' && values.options_raw.trim()
      ? values.options_raw.split(',').map((s) => s.trim()).filter(Boolean)
      : null
    const data = {
      field_name: values.field_name.trim(),
      label: values.label.trim(),
      field_type: values.field_type,
      options,
      is_required: values.is_required,
      is_pii: values.is_pii,
      request_field_mapping: mapping,
    }
    const result = await updateFormTemplateField(field.id, formTemplateId, data)
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    onSave({ ...field, ...data, options, request_field_mapping: mapping, field_type: values.field_type as FormFieldType })
  }

  return (
    <div className="px-4 py-4 bg-gray-50 space-y-3">
      <FieldFormFields values={values} set={set} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export function FieldFormFields({
  values,
  set,
}: {
  values: {
    field_name: string
    label: string
    field_type: string
    options_raw: string
    is_required: boolean
    is_pii: boolean
    mapping_raw: string
  }
  set: (key: string, value: unknown) => void
}) {
  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
        <input type="text" value={values.label} onChange={(e) => set('label', e.target.value)} required className={inputClass} placeholder="Home Address Line 1" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Field Name <span className="text-gray-400 font-normal">(key)</span></label>
        <input type="text" value={values.field_name} onChange={(e) => set('field_name', e.target.value)} required className={inputClass} placeholder="home_address_line1" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select value={values.field_type} onChange={(e) => set('field_type', e.target.value)} className={inputClass}>
          {(['text', 'textarea', 'date', 'select', 'checkbox', 'file'] as const).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      {values.field_type === 'select' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Options <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input type="text" value={values.options_raw} onChange={(e) => set('options_raw', e.target.value)} className={inputClass} placeholder="Option A, Option B, Option C" />
        </div>
      )}
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Field Mapping <span className="text-gray-400 font-normal">(optional JSON write-back)</span>
        </label>
        <textarea
          value={values.mapping_raw}
          onChange={(e) => set('mapping_raw', e.target.value)}
          rows={2}
          className={`${inputClass} resize-none font-mono text-xs`}
          placeholder={'{ "target_table": "requests_change_of_address", "target_field": "address_line1" }'}
        />
      </div>
      <div className="col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={values.is_required} onChange={(e) => set('is_required', e.target.checked)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          Required
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={values.is_pii} onChange={(e) => set('is_pii', e.target.checked)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          PII <span className="text-xs text-gray-400">(never sent to AI)</span>
        </label>
      </div>
    </div>
  )
}

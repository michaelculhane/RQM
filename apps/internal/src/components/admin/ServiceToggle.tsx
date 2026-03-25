'use client'

import { useState } from 'react'
import type { Service, Category } from '@/lib/types'
import { toggleService, updateServiceCategory } from '@/actions/admin'

interface ServiceToggleProps {
  service: Service
  categories: Category[]
}

export default function ServiceToggle({ service, categories }: ServiceToggleProps) {
  const [enabled, setEnabled] = useState(service.enabled)
  const [categoryId, setCategoryId] = useState(service.category_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    const newValue = !enabled
    setEnabled(newValue)
    setLoading(true)
    setError(null)
    const result = await toggleService(service.id, newValue)
    if (result?.error) {
      setError(result.error)
      setEnabled(!newValue)
    }
    setLoading(false)
  }

  async function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCategoryId = e.target.value || null
    setCategoryId(e.target.value)
    const result = await updateServiceCategory(service.id, newCategoryId)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="flex items-center justify-between py-4 px-5 gap-4">
      {/* Service info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800">{service.name}</p>
          <span className="text-xs text-gray-400 font-mono">{service.slug}</span>
        </div>
        {service.description && (
          <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
        )}
        {service.teams && (
          <p className="text-xs text-gray-400 mt-1">Team: {service.teams.name}</p>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Category selector */}
      <select
        value={categoryId}
        onChange={handleCategoryChange}
        disabled={loading}
        className="text-sm rounded-md border border-gray-300 px-2 py-1.5 text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${enabled ? 'bg-slate-700' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">{enabled ? 'Disable' : 'Enable'} {service.name}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}

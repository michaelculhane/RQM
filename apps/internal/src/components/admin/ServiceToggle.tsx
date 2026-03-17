'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'
import { toggleService } from '@/actions/admin'

interface ServiceToggleProps {
  service: Service
}

export default function ServiceToggle({ service }: ServiceToggleProps) {
  const [enabled, setEnabled] = useState(service.enabled)
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
      setEnabled(!newValue) // revert
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between py-4 px-5">
      {/* Service info */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800">{service.name}</p>
          <span className="text-xs text-gray-400 font-mono">{service.slug}</span>
        </div>
        {service.description && (
          <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
        )}
        {service.teams && (
          <p className="text-xs text-gray-400 mt-1">
            Team: {service.teams.name}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>

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

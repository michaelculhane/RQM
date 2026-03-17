'use client'

import { useState } from 'react'
import type { Status } from '@/lib/types'
import { STATUS_OPTIONS } from '@/lib/types'
import { updateStatus } from '@/actions/requests'

interface StatusSelectProps {
  requestId: string
  currentStatus: Status
}

export default function StatusSelect({ requestId, currentStatus }: StatusSelectProps) {
  const [value, setValue] = useState<Status>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status
    const oldStatus = value
    setValue(newStatus)
    setLoading(true)
    setError(null)

    const result = await updateStatus(requestId, newStatus, oldStatus)
    if (result?.error) {
      setError(result.error)
      setValue(oldStatus) // revert
    }
    setLoading(false)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        Status
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={loading}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

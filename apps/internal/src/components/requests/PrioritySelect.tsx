'use client'

import { useState } from 'react'
import type { Priority } from '@/lib/types'
import { PRIORITY_OPTIONS } from '@/lib/types'
import { updatePriority } from '@/actions/requests'

interface PrioritySelectProps {
  requestId: string
  currentPriority: Priority
}

export default function PrioritySelect({ requestId, currentPriority }: PrioritySelectProps) {
  const [value, setValue] = useState<Priority>(currentPriority)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPriority = e.target.value as Priority
    const oldPriority = value
    setValue(newPriority)
    setLoading(true)
    setError(null)

    const result = await updatePriority(requestId, newPriority, oldPriority)
    if (result?.error) {
      setError(result.error)
      setValue(oldPriority) // revert
    }
    setLoading(false)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        Priority
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={loading}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

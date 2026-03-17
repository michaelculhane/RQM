'use client'

import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { assignRequest } from '@/actions/requests'

interface AssignSelectProps {
  requestId: string
  currentAssignee: string | null
  agents: Profile[]
}

export default function AssignSelect({
  requestId,
  currentAssignee,
  agents,
}: AssignSelectProps) {
  const [value, setValue] = useState<string>(currentAssignee ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value
    const oldValue = value
    setValue(newValue)
    setLoading(true)
    setError(null)

    const assigneeId = newValue || null
    const agent = agents.find((a) => a.id === newValue)
    const assigneeName = agent?.full_name ?? null

    const result = await assignRequest(requestId, assigneeId, assigneeName)
    if (result?.error) {
      setError(result.error)
      setValue(oldValue) // revert
    }
    setLoading(false)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        Assigned To
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={loading}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
      >
        <option value="">Unassigned</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.full_name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

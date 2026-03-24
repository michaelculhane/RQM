'use client'
import { useState } from 'react'
import { addTeamRole, removeTeamRole } from '@/actions/roles'
import type { Team } from '@/lib/types'

interface Props {
  roleId: string
  assignedTeams: Team[]
  unassignedTeams: Team[]
}

export default function RoleTeamsEditor({ roleId, assignedTeams, unassignedTeams }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!selectedTeamId) return
    setLoading(true)
    setError(null)
    const result = await addTeamRole(roleId, selectedTeamId)
    if (result?.error) setError(result.error)
    else setSelectedTeamId('')
    setLoading(false)
  }

  async function handleRemove(teamId: string) {
    setRemoving(teamId)
    await removeTeamRole(roleId, teamId)
    setRemoving(null)
  }

  return (
    <div className="space-y-3">
      {/* Assigned teams */}
      {assignedTeams.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {assignedTeams.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {t.name}
              <button
                type="button"
                onClick={() => handleRemove(t.id)}
                disabled={removing === t.id}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
                aria-label={`Remove ${t.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No teams associated yet.</p>
      )}

      {/* Add team */}
      {unassignedTeams.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="">Add team…</option>
            {unassignedTeams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading || !selectedTeamId}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '…' : 'Add'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

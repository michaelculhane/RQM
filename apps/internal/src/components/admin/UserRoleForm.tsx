'use client'

import { useState } from 'react'
import type { Profile, Team, Role } from '@/lib/types'
import { updateUserRole } from '@/actions/admin'

interface UserRoleFormProps {
  user: Profile
  teams: Team[]
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr_agent', label: 'HR Agent' },
  { value: 'hr_admin', label: 'HR Admin' },
]

export default function UserRoleForm({ user, teams }: UserRoleFormProps) {
  const [role, setRole] = useState<Role>(user.role)
  const [teamId, setTeamId] = useState<string>(user.team_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isDirty = role !== user.role || teamId !== (user.team_id ?? '')

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSaved(false)

    const result = await updateUserRole(user.id, role, teamId || null)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setLoading(false)
  }

  const selectClass =
    'block rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500'

  return (
    <tr className="hover:bg-gray-50">
      {/* Name */}
      <td className="px-4 py-3 text-sm font-medium text-gray-800">
        {user.full_name}
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-sm text-gray-500">
        {user.email}
      </td>

      {/* Role select */}
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role)
            setSaved(false)
          }}
          className={selectClass}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>

      {/* Team select */}
      <td className="px-4 py-3">
        <select
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value)
            setSaved(false)
          }}
          className={selectClass}
        >
          <option value="">No team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !isDirty}
            className="inline-flex items-center rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>

          {saved && (
            <span className="text-xs text-green-600 font-medium">Saved!</span>
          )}
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
        </div>
      </td>
    </tr>
  )
}

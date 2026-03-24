'use client'

import { useState } from 'react'
import type { Profile, Team, Role, CustomRole } from '@/lib/types'
import { updateUserRole } from '@/actions/admin'
import { addUserRole, removeUserRole } from '@/actions/roles'

interface UserRoleFormProps {
  user: Profile
  teams: Team[]
  customRoles: CustomRole[]
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr_agent', label: 'HR Agent' },
  { value: 'hr_admin', label: 'HR Admin' },
]

export default function UserRoleForm({ user, teams, customRoles }: UserRoleFormProps) {
  const [role, setRole] = useState<Role>(user.role)
  const [teamId, setTeamId] = useState<string>(user.team_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const assignedRoles: CustomRole[] = (user.profile_roles ?? [])
    .map((pr) => pr.roles)
    .filter((r): r is CustomRole => Boolean(r))

  const assignedRoleIds = new Set(assignedRoles.map((r) => r.id))
  const availableToAdd = customRoles.filter((r) => !assignedRoleIds.has(r.id))

  const [showAdd, setShowAdd] = useState(false)
  const [roleToAdd, setRoleToAdd] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

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

  async function handleAddRole() {
    if (!roleToAdd) return
    setRoleLoading(true)
    await addUserRole(user.id, roleToAdd)
    setRoleToAdd('')
    setShowAdd(false)
    setRoleLoading(false)
  }

  async function handleRemoveRole(roleId: string) {
    setRemoving(roleId)
    await removeUserRole(user.id, roleId)
    setRemoving(null)
  }

  const selectClass =
    'block rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500'

  return (
    <tr className="hover:bg-gray-50 align-top">
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
          onChange={(e) => { setRole(e.target.value as Role); setSaved(false) }}
          className={selectClass}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>

      {/* Team select */}
      <td className="px-4 py-3">
        <select
          value={teamId}
          onChange={(e) => { setTeamId(e.target.value); setSaved(false) }}
          className={selectClass}
        >
          <option value="">No team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </td>

      {/* Custom roles — multi-assign */}
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          {/* Current roles */}
          <div className="flex flex-wrap gap-1">
            {assignedRoles.length === 0 && (
              <span className="text-xs text-gray-400">None</span>
            )}
            {assignedRoles.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {r.name}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(r.id)}
                  disabled={removing === r.id}
                  className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 leading-none"
                  aria-label={`Remove ${r.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Add role */}
          {showAdd ? (
            <div className="flex items-center gap-1">
              <select
                value={roleToAdd}
                onChange={(e) => setRoleToAdd(e.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="">Select…</option>
                {availableToAdd.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddRole}
                disabled={roleLoading || !roleToAdd}
                className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setRoleToAdd('') }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            availableToAdd.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                + Add role
              </button>
            )
          )}
        </div>
      </td>

      {/* Save (role + team only) */}
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

          {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  )
}

'use client'
import { useState } from 'react'
import { addPermission, deletePermission } from '@/actions/roles'
import type { RolePermission, Service } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: 'open',             label: 'Open' },
  { value: 'in_progress',      label: 'In Progress' },
  { value: 'pending_employee', label: 'Pending' },
  { value: 'resolved',         label: 'Resolved' },
  { value: 'closed',           label: 'Closed' },
]

interface Props {
  roleId: string
  permissions: RolePermission[]
  services: Service[]
}

function PermissionRow({
  perm,
  services,
  onDelete,
  deleting,
}: {
  perm: RolePermission
  services: Service[]
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const serviceName = perm.service_slug
    ? services.find((s) => s.slug === perm.service_slug)?.name ?? perm.service_slug
    : null

  const crud = [
    perm.can_read   && 'Read',
    perm.can_create && 'Create',
    perm.can_update && 'Update',
    perm.can_delete && 'Delete',
  ].filter(Boolean).join(', ')

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{perm.table_name}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{crud || <span className="text-gray-400">—</span>}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {perm.status_in && perm.status_in.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {perm.status_in.map((s) => (
              <span key={s} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Any</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {serviceName ? (
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-700">{serviceName}</span>
        ) : (
          <span className="text-gray-400 text-xs">Any</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {perm.opened_by_self ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Own only</span>
        ) : (
          <span className="text-gray-400 text-xs">Any</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onDelete(perm.id)}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-700 transition-colors disabled:opacity-40"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default function RolePermissionsEditor({ roleId, permissions, services }: Props) {
  const [canRead, setCanRead] = useState(true)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [statusIn, setStatusIn] = useState<string[]>([])
  const [serviceSlug, setServiceSlug] = useState('')
  const [openedBySelf, setOpenedBySelf] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function toggleStatus(val: string) {
    setStatusIn((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    )
  }

  async function handleAdd() {
    if (!canRead && !canCreate && !canUpdate && !canDelete) {
      setAddError('Select at least one permission.')
      return
    }
    setAdding(true)
    setAddError(null)
    const result = await addPermission(
      roleId, 'tasks',
      canRead, canCreate, canUpdate, canDelete,
      statusIn.length > 0 ? statusIn : null,
      serviceSlug || null,
      openedBySelf,
    )
    if (result?.error) {
      setAddError(result.error)
    } else {
      setCanRead(true); setCanCreate(false); setCanUpdate(false); setCanDelete(false)
      setStatusIn([]); setServiceSlug(''); setOpenedBySelf(false)
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await deletePermission(id, roleId)
    setDeleting(null)
  }

  const checkboxClass = 'rounded border-gray-300 text-slate-700 focus:ring-slate-500'
  const selectClass =
    'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500'

  return (
    <div className="space-y-5">
      {/* Existing permissions */}
      {permissions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Table', 'Access', 'Status', 'Service', 'Scope', ''].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {permissions.map((p) => (
                <PermissionRow
                  key={p.id}
                  perm={p}
                  services={services}
                  onDelete={handleDelete}
                  deleting={deleting === p.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No permission rules yet.</p>
      )}

      {/* Add permission form */}
      <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Rule</p>

        {/* CRUD */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Access</p>
          <div className="flex flex-wrap gap-4">
            {([
              ['can_read',   'Read',   canRead,   setCanRead],
              ['can_create', 'Create', canCreate, setCanCreate],
              ['can_update', 'Update', canUpdate, setCanUpdate],
              ['can_delete', 'Delete', canDelete, setCanDelete],
            ] as [string, string, boolean, (v: boolean) => void][]).map(([key, label, val, setter]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setter(e.target.checked)}
                  className={checkboxClass}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Status criteria */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            Status <span className="text-gray-400 font-normal">(leave empty for any)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusIn.includes(opt.value)}
                  onChange={() => toggleStatus(opt.value)}
                  className={checkboxClass}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Service criteria */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            Service <span className="text-gray-400 font-normal">(leave empty for any)</span>
          </p>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className={selectClass}
          >
            <option value="">Any service</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Scope criteria */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Scope</p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={openedBySelf}
              onChange={(e) => setOpenedBySelf(e.target.checked)}
              className={checkboxClass}
            />
            <span>
              Own requests only{' '}
              <span className="text-gray-400 text-xs font-normal">
                — restrict to records this user opened or was opened for
              </span>
            </span>
          </label>
        </div>

        {addError && <p className="text-xs text-red-600">{addError}</p>}

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="rounded-md bg-slate-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {adding ? 'Adding…' : 'Add Rule'}
        </button>
      </div>
    </div>
  )
}

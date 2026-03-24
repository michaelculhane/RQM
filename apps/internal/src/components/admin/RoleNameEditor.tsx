'use client'
import { useState } from 'react'
import { updateRole } from '@/actions/roles'

interface Props {
  roleId: string
  initialName: string
  initialDescription: string
}

export default function RoleNameEditor({ roleId, initialName, initialDescription }: Props) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isDirty = name !== initialName || description !== initialDescription

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    setSaved(false)
    const result = await updateRole(roleId, name, description)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setLoading(false)
  }

  const inputClass =
    'block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent'

  return (
    <div className="space-y-3 max-w-md">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false) }}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); setSaved(false) }}
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !isDirty || !name.trim()}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
      </div>
    </div>
  )
}

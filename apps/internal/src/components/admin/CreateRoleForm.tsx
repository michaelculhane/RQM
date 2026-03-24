'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRole } from '@/actions/roles'

export default function CreateRoleForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const result = await createRole(name, description)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/admin/roles/${result.id}`)
    }
  }

  const inputClass =
    'block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input
          type="text"
          placeholder="e.g. Benefits Processing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          placeholder="What can users with this role do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating…' : 'Create Role'}
      </button>
    </form>
  )
}

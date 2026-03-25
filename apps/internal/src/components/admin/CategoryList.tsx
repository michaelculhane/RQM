'use client'

import { useState } from 'react'
import type { Category } from '@/lib/types'
import { deleteCategory } from '@/actions/admin'

interface CategoryListProps {
  categories: Category[]
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [items, setItems] = useState(categories)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    const result = await deleteCategory(id)
    if (result?.error) {
      setError(result.error)
    } else {
      setItems((prev) => prev.filter((c) => c.id !== id))
    }
    setDeletingId(null)
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No categories yet. Add one below.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {error && (
        <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600">{error}</div>
      )}
      <ul className="divide-y divide-gray-100">
        {items.map((category) => (
          <li key={category.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{category.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{category.slug}</p>
            </div>
            <button
              onClick={() => handleDelete(category.id)}
              disabled={deletingId === category.id}
              className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
            >
              {deletingId === category.id ? 'Deleting…' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

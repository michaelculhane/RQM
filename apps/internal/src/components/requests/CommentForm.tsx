'use client'

import { useState, useRef } from 'react'
import { addComment } from '@/actions/requests'

interface CommentFormProps {
  requestId: string
}

type Tab = 'public' | 'internal'

export default function CommentForm({ requestId }: CommentFormProps) {
  const [tab, setTab] = useState<Tab>('public')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    setLoading(true)
    setError(null)

    const result = await addComment(requestId, body.trim(), tab === 'internal')
    if (result?.error) {
      setError(result.error)
    } else {
      setBody('')
      textareaRef.current?.focus()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Reply</h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('public')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'public'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Public Reply
        </button>
        <button
          type="button"
          onClick={() => setTab('internal')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'internal'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Internal Note
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {tab === 'internal' && (
          <div className="mb-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            This note is only visible to HR staff, not to the employee.
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder={
            tab === 'public'
              ? 'Write a reply visible to the employee…'
              : 'Write an internal note for HR staff only…'
          }
          className={`block w-full rounded-md border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none ${
            tab === 'internal'
              ? 'border-amber-300 bg-amber-50 focus:ring-amber-400'
              : 'border-gray-300 bg-white focus:ring-slate-500'
          }`}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              tab === 'internal'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {loading
              ? 'Submitting…'
              : tab === 'public'
              ? 'Send Reply'
              : 'Add Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

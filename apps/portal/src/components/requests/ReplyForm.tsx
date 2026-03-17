'use client'
import { useState, useRef } from 'react'
import { addReply } from '@/actions/requests'

interface ReplyFormProps {
  requestId: string
}

export default function ReplyForm({ requestId }: ReplyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const body = textareaRef.current?.value.trim()
    if (!body) return

    setError(null)
    setLoading(true)

    const result = await addReply(requestId, body)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Clear on success
    if (textareaRef.current) textareaRef.current.value = ''
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="reply-body" className="block text-sm font-medium text-gray-700 mb-1">
          Add a Reply
        </label>
        <textarea
          id="reply-body"
          ref={textareaRef}
          rows={3}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          placeholder="Write your reply here…"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending…' : 'Send Reply'}
        </button>
      </div>
    </form>
  )
}

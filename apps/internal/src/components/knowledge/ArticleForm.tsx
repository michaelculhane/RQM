'use client'
import { useRef, useState, useTransition } from 'react'
import { marked } from 'marked'
import type { KnowledgeArticle } from '@/lib/types'

interface ArticleFormProps {
  article?: KnowledgeArticle
  onSave: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>
}

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  retired:   'bg-red-100 text-red-700',
}

export default function ArticleForm({ article, onSave }: ArticleFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const status = article?.status ?? 'draft'
  const [body, setBody] = useState(article?.body ?? '')
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  function submit(action: string) {
    setError(null)
    setSaved(false)
    const fd = new FormData(formRef.current!)
    fd.set('action', action)
    startTransition(async () => {
      const result = await onSave(fd)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      {/* Status pill */}
      {article && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={article?.title ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Article title"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={article?.category ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Benefits, Payroll, Onboarding"
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-md border border-gray-200 text-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`px-3 py-1 ${tab === 'write' ? 'bg-gray-100 font-medium text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`px-3 py-1 border-l border-gray-200 ${tab === 'preview' ? 'bg-gray-100 font-medium text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Preview
            </button>
          </div>
        </div>

        {tab === 'write' ? (
          <textarea
            id="body"
            name="body"
            required
            rows={18}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            placeholder="Write the article content here using Markdown…"
          />
        ) : (
          <>
            <textarea name="body" value={body} onChange={() => {}} className="hidden" />
            <div
              className="w-full min-h-[18rem] rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: marked.parse(body) as string }}
            />
          </>
        )}
        <p className="mt-1 text-xs text-gray-400">Markdown supported — **bold**, *italic*, # headings, - lists, `code`, [links](url)</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit('save')}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Draft'}
        </button>

        {status !== 'published' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit('publish')}
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Publishing…' : 'Publish'}
          </button>
        )}

        {status === 'published' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit('retire')}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Retire
          </button>
        )}

        {status === 'retired' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit('reactivate')}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Reactivate (back to Draft)
          </button>
        )}
      </div>
    </form>
  )
}

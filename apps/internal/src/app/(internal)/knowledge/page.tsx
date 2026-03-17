import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { KnowledgeArticle } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  retired:   'bg-red-100 text-red-600',
}

export default async function KnowledgeListPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('knowledge_articles')
    .select('*, author:author_id(full_name)')
    .order('updated_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data: articles } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage articles for employees.</p>
        </div>
        <Link
          href="/knowledge/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search articles…"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white shadow-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="retired">Retired</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
        >
          Filter
        </button>
        {(searchParams.q || searchParams.status) && (
          <Link href="/knowledge" className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No articles found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(articles as (KnowledgeArticle & { author: { full_name: string } | null })[]).map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.category ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.author?.full_name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(article.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/knowledge/${article.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

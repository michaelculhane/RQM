import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { KnowledgeArticle } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('knowledge_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data: articles } = await query
  const { data: categoriesRaw } = await supabase
    .from('knowledge_articles')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null)

  const categories = [...new Set((categoriesRaw ?? []).map((r) => r.category).filter(Boolean))] as string[]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-1 text-sm text-gray-500">Browse HR guides, policies, and FAQs.</p>
      </div>

      {/* Search + filter */}
      <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search articles…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {categories.length > 0 && (
          <select
            name="category"
            defaultValue={searchParams.category ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Search
        </button>
        {(searchParams.q || searchParams.category) && (
          <Link
            href="/knowledge"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Articles */}
      {!articles || articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm">No articles found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(articles as KnowledgeArticle[]).map((article) => (
            <Link
              key={article.id}
              href={`/knowledge/${article.slug}`}
              className="block bg-white rounded-lg border border-gray-200 px-6 py-5 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-brand-600">
                    {article.title}
                  </h2>
                  {article.body && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {article.body.slice(0, 200)}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    {article.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                        {article.category}
                      </span>
                    )}
                    <span>
                      Published {article.published_at ? formatDate(article.published_at) : ''}
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

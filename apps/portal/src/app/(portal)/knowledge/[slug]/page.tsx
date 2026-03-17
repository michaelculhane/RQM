import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { KnowledgeArticle } from '@/lib/types'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  const a = article as KnowledgeArticle

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/knowledge"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Knowledge Base
      </Link>

      <article className="bg-white rounded-lg border border-gray-200 px-8 py-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          {a.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mb-3">
              {a.category}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{a.title}</h1>
          <p className="mt-2 text-xs text-gray-400">
            {a.published_at ? `Published ${formatDate(a.published_at)}` : ''}
            {a.updated_at !== a.created_at ? ` · Updated ${formatDate(a.updated_at)}` : ''}
          </p>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {a.body}
        </div>
      </article>
    </div>
  )
}

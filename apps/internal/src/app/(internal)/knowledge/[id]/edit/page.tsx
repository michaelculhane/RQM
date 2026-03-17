import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArticleForm from '@/components/knowledge/ArticleForm'
import { updateArticle } from '@/actions/knowledge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { KnowledgeArticle } from '@/lib/types'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!article) notFound()

  const a = article as KnowledgeArticle

  async function save(formData: FormData) {
    'use server'
    return updateArticle(params.id, formData)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Knowledge Base
        </Link>
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Edit Article</h1>
          <p className="text-xs text-gray-400 mt-1">
            Last updated {formatDate(a.updated_at)}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <ArticleForm article={a} onSave={save} />
      </div>
    </div>
  )
}

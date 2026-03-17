import ArticleForm from '@/components/knowledge/ArticleForm'
import { createArticle } from '@/actions/knowledge'
import Link from 'next/link'

export default function NewArticlePage() {
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
        <h1 className="text-xl font-semibold text-gray-900">New Article</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <ArticleForm onSave={createArticle} />
      </div>
    </div>
  )
}

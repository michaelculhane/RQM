'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ServiceResult {
  name: string
  slug: string
  description: string | null
  categorySlug: string | null
}

interface ArticleResult {
  title: string
  slug: string
  category: string | null
}

export default function SearchBar({
  services,
  articles,
}: {
  services: ServiceResult[]
  articles: ArticleResult[]
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()

  const matchedServices = q.length < 2 ? [] : services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q)
  ).slice(0, 5)

  const matchedArticles = q.length < 2 ? [] : articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      (a.category ?? '').toLowerCase().includes(q)
  ).slice(0, 4)

  const hasResults = matchedServices.length > 0 || matchedArticles.length > 0
  const showDropdown = open && q.length >= 2

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search services, policies, guides…"
          className="block w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {matchedServices.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    Services
                  </div>
                  {matchedServices.map((svc) => (
                    <Link
                      key={svc.slug}
                      href={`/requests/new?service=${svc.slug}`}
                      onClick={() => { setQuery(''); setOpen(false) }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-brand-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{svc.name}</p>
                        {svc.description && (
                          <p className="text-xs text-gray-400 truncate">{svc.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-brand-500 flex-shrink-0">Submit →</span>
                    </Link>
                  ))}
                </div>
              )}
              {matchedArticles.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    Knowledge Base
                  </div>
                  {matchedArticles.map((art) => (
                    <Link
                      key={art.slug}
                      href={`/knowledge/${art.slug}`}
                      onClick={() => { setQuery(''); setOpen(false) }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{art.title}</p>
                        {art.category && (
                          <p className="text-xs text-gray-400">{art.category}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">Read →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

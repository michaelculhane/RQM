import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AnnouncementsCarousel from '@/components/home/AnnouncementsCarousel'
import SearchBar from '@/components/home/SearchBar'
import type { Announcement } from '@/lib/types'

export default async function HomePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: announcements },
    { data: services },
    { data: articles },
    { count: openTaskCount },
    { count: openRequestCount },
  ] = await Promise.all([
    supabase.from('announcements').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('services').select('name, slug, description, categories(slug)').eq('enabled', true).order('name'),
    supabase.from('knowledge_articles').select('title, slug, category').eq('status', 'published').order('title'),
    supabase.from('request_tasks').select('id', { count: 'exact', head: true }).eq('assigned_to', user!.id).eq('status', 'open'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('opened_by', user!.id).in('status', ['open', 'in_progress', 'pending_employee']),
  ])

  const allAnnouncements = (announcements ?? []) as Announcement[]

  const serviceResults = (services ?? []).map((s: any) => ({
    name: s.name as string,
    slug: s.slug as string,
    description: s.description as string | null,
    categorySlug: Array.isArray(s.categories) ? (s.categories[0]?.slug ?? null) : (s.categories?.slug ?? null),
  }))

  const articleResults = (articles ?? []).map((a: any) => ({
    title: a.title as string,
    slug: a.slug as string,
    category: a.category as string | null,
  }))

  const quickLinks = [
    {
      href: '/services',
      label: 'Submit a Request',
      description: 'Browse HR services and open a new request.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      color: 'bg-brand-50 text-brand-600',
    },
    {
      href: '/requests',
      label: 'My Requests',
      description: `${openRequestCount ?? 0} active request${openRequestCount === 1 ? '' : 's'} in progress.`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href: '/tasks',
      label: 'My Tasks',
      description: openTaskCount
        ? `You have ${openTaskCount} open task${openTaskCount === 1 ? '' : 's'} awaiting action.`
        : 'No open tasks right now.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: openTaskCount ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600',
      badge: openTaskCount ?? 0,
    },
    {
      href: '/knowledge',
      label: 'Knowledge Base',
      description: 'Browse HR guides, policies, and FAQs.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-violet-50 text-violet-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Announcements */}
      {allAnnouncements.length > 0 && (
        <AnnouncementsCarousel announcements={allAnnouncements} />
      )}

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <SearchBar services={serviceResults} articles={articleResults} />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}>
                  {link.icon}
                </div>
                {link.badge != null && link.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-amber-500 text-white text-xs font-bold px-1.5">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                  {link.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

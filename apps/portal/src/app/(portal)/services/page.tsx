import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Category } from '@/lib/types'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'compensation': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'leave-programs': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  'hr-systems': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25" />
    </svg>
  ),
  'benefits': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  'awards': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  ),
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  'compensation':   { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  'leave-programs': { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100'    },
  'hr-systems':     { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100'  },
  'benefits':       { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-rose-100'    },
  'awards':         { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100'   },
}

const DEFAULT_COLOR = { bg: 'bg-gray-50', icon: 'text-gray-500', border: 'border-gray-100' }

export default async function ServicesPage() {
  const supabase = createClient()

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('services').select('category_id').eq('enabled', true),
  ])

  const countByCategory: Record<string, number> = {}
  for (const svc of services ?? []) {
    if (svc.category_id) {
      countByCategory[svc.category_id] = (countByCategory[svc.category_id] ?? 0) + 1
    }
  }

  const allCategories = (categories ?? []) as Category[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse available HR services and submit a request.
        </p>
      </div>

      {allCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">No services available</h3>
          <p className="mt-1 text-sm text-gray-500">Services will appear here once they are configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCategories.map((category) => {
            const colors = CATEGORY_COLORS[category.slug] ?? DEFAULT_COLOR
            const icon = CATEGORY_ICONS[category.slug]
            const count = countByCategory[category.id] ?? 0
            return (
              <Link
                key={category.id}
                href={`/services/${category.slug}`}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className={`flex-shrink-0 rounded-lg p-3 ${colors.bg} ${colors.border} border`}>
                  <span className={colors.icon}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {count} {count === 1 ? 'service' : 'services'}
                  </p>
                </div>
                <svg className="flex-shrink-0 w-5 h-5 text-gray-300 group-hover:text-brand-400 transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServiceToggle from '@/components/admin/ServiceToggle'
import type { Service, Category } from '@/lib/types'

export default async function AdminServicesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'hr_admin') {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 max-w-md">
          <h1 className="text-base font-semibold text-red-800">Access Denied</h1>
          <p className="mt-1 text-sm text-red-600">
            You do not have permission to access this page. Admin access is required.
          </p>
        </div>
      </div>
    )
  }

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase.from('services').select('*, teams(*), categories(*)').order('name'),
    supabase.from('categories').select('*').order('sort_order'),
  ])

  const allServices = (services ?? []) as Service[]
  const allCategories = (categories ?? []) as Category[]

  // Group by category
  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.id, c.name]))

  const grouped = allServices.reduce<Record<string, Service[]>>((acc, svc) => {
    const key = svc.category_id ? (categoryMap[svc.category_id] ?? 'Uncategorized') : 'Uncategorized'
    if (!acc[key]) acc[key] = []
    acc[key].push(svc)
    return acc
  }, {})

  // Order: categories in sort_order, then uncategorized
  const sectionOrder = [
    ...allCategories.map((c) => c.name).filter((n) => grouped[n]),
    ...(grouped['Uncategorized'] ? ['Uncategorized'] : []),
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enable or disable services and assign them to categories.
        </p>
      </div>

      {allServices.length === 0 ? (
        <p className="text-sm text-gray-500">No services found.</p>
      ) : (
        <div className="space-y-6">
          {sectionOrder.map((sectionName) => (
            <div key={sectionName} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {sectionName}
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {grouped[sectionName].map((svc) => (
                  <ServiceToggle key={svc.id} service={svc} categories={allCategories} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

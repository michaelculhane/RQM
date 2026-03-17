import { createClient } from '@/lib/supabase/server'
import ServiceCard from '@/components/services/ServiceCard'
import type { Service } from '@/lib/types'

export default async function ServicesPage() {
  const supabase = createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select('*, teams(*)')
    .eq('enabled', true)
    .order('name')

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load services. Please try again.
      </div>
    )
  }

  // Group services by team
  const grouped: Record<string, Service[]> = {}
  for (const service of (services ?? []) as Service[]) {
    const teamName = service.teams?.name ?? 'General'
    if (!grouped[teamName]) grouped[teamName] = []
    grouped[teamName].push(service)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse available HR services and submit a request.
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No services available</h3>
          <p className="mt-1 text-sm text-gray-500">Services will appear here once they are configured.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([teamName, teamServices]) => (
            <section key={teamName}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {teamName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

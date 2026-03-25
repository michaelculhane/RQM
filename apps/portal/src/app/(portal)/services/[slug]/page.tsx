import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ServiceCard from '@/components/services/ServiceCard'
import type { Service } from '@/lib/types'

interface CategoryServicesPageProps {
  params: { slug: string }
}

export default async function CategoryServicesPage({ params }: CategoryServicesPageProps) {
  const supabase = createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*, teams(*), categories(*)')
    .eq('enabled', true)
    .eq('category_id', category.id)
    .order('name')

  const allServices = (services ?? []) as Service[]

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/services" className="hover:text-gray-700">Service Catalog</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {allServices.length} {allServices.length === 1 ? 'service' : 'services'} available
        </p>
      </div>

      {allServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">No services in this category</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later or browse other categories.</p>
          <Link href="/services" className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-500">
            ← Back to catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}

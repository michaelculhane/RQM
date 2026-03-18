import { createClient } from '@/lib/supabase/server'
import RequestForm from '@/components/requests/RequestForm'
import Link from 'next/link'
import type { Service } from '@/lib/types'

interface NewRequestPageProps {
  searchParams: { service?: string }
}

export default async function NewRequestPage({ searchParams }: NewRequestPageProps) {
  const serviceSlug = searchParams.service

  if (!serviceSlug) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-medium text-gray-900">No service selected</h2>
        <p className="mt-1 text-sm text-gray-500">Please select a service from the catalog.</p>
        <Link
          href="/services"
          className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-500"
        >
          Browse Services
        </Link>
      </div>
    )
  }

  const supabase = createClient()
  const { data: service } = await supabase
    .from('services')
    .select('*, teams(*)')
    .eq('slug', serviceSlug)
    .eq('enabled', true)
    .single()

  if (!service) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-medium text-gray-900">Service not found</h2>
        <p className="mt-1 text-sm text-gray-500">
          The service &ldquo;{serviceSlug}&rdquo; does not exist or is not available.
        </p>
        <Link
          href="/services"
          className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-500"
        >
          Browse Services
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/services" className="hover:text-gray-700">
          Services
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{service.name}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Request</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to submit your request.
        </p>
      </div>

      <RequestForm service={service as Service} />
    </div>
  )
}

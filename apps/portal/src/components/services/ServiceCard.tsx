import Link from 'next/link'
import type { Service } from '@/lib/types'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1">
        {service.teams && (
          <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5 mb-3">
            {service.teams.name}
          </span>
        )}
        <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
        {service.description && (
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{service.description}</p>
        )}
      </div>

      <Link
        href={`/requests/new?service=${service.slug}`}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit Request
      </Link>
    </div>
  )
}

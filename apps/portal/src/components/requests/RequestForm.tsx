'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitRequest } from '@/actions/requests'
import type { Service } from '@/lib/types'
import HiringFields from './HiringFields'
import BenefitsFields from './BenefitsFields'
import SystemAccessFields from './SystemAccessFields'
import AddressFields from './AddressFields'
import DirectDepositFields from './DirectDepositFields'

interface RequestFormProps {
  service: Service
}

const SLUG_FIELD_MAP: Record<string, React.ReactNode> = {
  hiring: <HiringFields />,
  benefits: <BenefitsFields />,
  'system-access': <SystemAccessFields />,
  'change-of-address': <AddressFields />,
  'direct-deposit': <DirectDepositFields />,
}

// Also match partial slugs
function getFieldsForSlug(slug: string): React.ReactNode | null {
  if (SLUG_FIELD_MAP[slug]) return SLUG_FIELD_MAP[slug]
  if (slug.includes('hiring')) return <HiringFields />
  if (slug.includes('benefit')) return <BenefitsFields />
  if (slug.includes('access')) return <SystemAccessFields />
  if (slug.includes('address')) return <AddressFields />
  if (slug.includes('deposit') || slug.includes('payroll')) return <DirectDepositFields />
  return null
}

export default function RequestForm({ service }: RequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const serviceFields = getFieldsForSlug(service.slug)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const description = formData.get('description') as string

    // Collect all extra fields (everything except description)
    const fields: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (key !== 'description') {
        fields[key] = value as string
      }
    })

    const result = await submitRequest(service.slug, description, fields)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/requests')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Service header */}
        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{service.name}</h2>
          {service.description && (
            <p className="mt-1 text-sm text-gray-500">{service.description}</p>
          )}
        </div>

        {/* Common description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="Describe your request in detail…"
          />
        </div>

        {/* Service-specific fields */}
        {serviceFields && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Additional Details</h3>
            {serviceFields}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}

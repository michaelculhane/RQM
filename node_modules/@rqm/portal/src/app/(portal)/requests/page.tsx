import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RequestCard from '@/components/requests/RequestCard'
import type { Request } from '@/lib/types'

export default async function RequestsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: requests, error } = await supabase
    .from('requests')
    .select('*, services(*, teams(*)), teams(*)')
    .eq('opened_by', user.id)
    .order('opened_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load requests. Please try again.
      </div>
    )
  }

  const typedRequests = (requests ?? []) as Request[]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your submitted HR requests.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          New Request
        </Link>
      </div>

      {typedRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by submitting a new HR request.</p>
          <Link
            href="/services"
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {typedRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

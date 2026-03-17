import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserRoleForm from '@/components/admin/UserRoleForm'
import type { Profile, Team } from '@/lib/types'

export default async function AdminUsersPage() {
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

  const [{ data: profiles }, { data: teams }] = await Promise.all([
    supabase.from('profiles').select('*, teams(*)').order('full_name'),
    supabase.from('teams').select('*').order('name'),
  ])

  const allProfiles = (profiles ?? []) as Profile[]
  const allTeams = (teams ?? []) as Team[]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage user roles and team assignments.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {allProfiles.length === 0 ? (
          <div className="px-8 py-12 text-center text-sm text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Team', 'Actions'].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {allProfiles.map((u) => (
                  <UserRoleForm key={u.id} user={u} teams={allTeams} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

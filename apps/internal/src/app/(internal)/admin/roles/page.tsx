import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CreateRoleForm from '@/components/admin/CreateRoleForm'

export default async function AdminRolesPage() {
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
          <p className="mt-1 text-sm text-red-600">Admin access is required.</p>
        </div>
      </div>
    )
  }

  const { data: roles } = await supabase
    .from('roles')
    .select('*, team_roles(teams(name)), role_permissions(id)')
    .order('name')

  const allRoles = roles ?? []

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define custom roles with fine-grained access to records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role list */}
        <div className="lg:col-span-2">
          {allRoles.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-8 py-12 text-center text-sm text-gray-500">
              No roles yet. Create one to get started.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Role', 'Teams', 'Permissions', ''].map((col) => (
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
                  {allRoles.map((r) => {
                    const teamCount = Array.isArray(r.team_roles) ? r.team_roles.length : 0
                    const permCount = Array.isArray(r.role_permissions) ? r.role_permissions.length : 0
                    const teamNames = Array.isArray(r.team_roles)
                      ? r.team_roles.map((tr: any) => tr.teams?.name).filter(Boolean).join(', ')
                      : ''
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{r.name}</p>
                          {r.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {teamCount > 0 ? (
                            <span title={teamNames}>{teamCount} team{teamCount !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {permCount > 0 ? (
                            <span>{permCount} rule{permCount !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-amber-500">No rules</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/roles/${r.id}`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            Edit →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create role form */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">New Role</h2>
            <CreateRoleForm />
          </div>
        </div>
      </div>
    </div>
  )
}

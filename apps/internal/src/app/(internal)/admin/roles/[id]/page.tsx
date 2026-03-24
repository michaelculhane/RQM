import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RoleNameEditor from '@/components/admin/RoleNameEditor'
import RoleTeamsEditor from '@/components/admin/RoleTeamsEditor'
import RolePermissionsEditor from '@/components/admin/RolePermissionsEditor'
import type { RolePermission, Service, Team } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default async function RoleDetailPage({ params }: Props) {
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

  const [
    { data: role },
    { data: allTeams },
    { data: allServices },
    { data: permissions },
    { data: teamRoles },
  ] = await Promise.all([
    supabase.from('roles').select('*').eq('id', params.id).single(),
    supabase.from('teams').select('*').order('name'),
    supabase.from('services').select('id, name, slug').order('name'),
    supabase.from('role_permissions').select('*').eq('role_id', params.id).order('table_name'),
    supabase.from('team_roles').select('team_id, teams(id, name, slug)').eq('role_id', params.id),
  ])

  if (!role) notFound()

  const assignedTeamIds = new Set((teamRoles ?? []).map((tr: any) => tr.team_id))
  const unassignedTeams = (allTeams ?? []).filter((t: Team) => !assignedTeamIds.has(t.id))
  const assignedTeams = (teamRoles ?? []).map((tr: any) => tr.teams).filter(Boolean) as Team[]

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/roles" className="hover:text-gray-700 transition-colors">
          Roles
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{role.name}</span>
      </div>

      {/* Name & description */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Role Details
        </h2>
        <RoleNameEditor
          roleId={role.id}
          initialName={role.name}
          initialDescription={role.description ?? ''}
        />
      </div>

      {/* Team associations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Teams
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Associate this role with teams for organizational context. Users are assigned their
          custom role individually on the Users page.
        </p>
        <RoleTeamsEditor
          roleId={role.id}
          assignedTeams={assignedTeams}
          unassignedTeams={unassignedTeams as Team[]}
        />
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Permissions
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Each rule grants access to a table. Criteria (status, service) narrow which records
          the rule applies to — leave blank to match all records.
        </p>
        <RolePermissionsEditor
          roleId={role.id}
          permissions={(permissions ?? []) as RolePermission[]}
          services={(allServices ?? []) as Service[]}
        />
      </div>
    </div>
  )
}

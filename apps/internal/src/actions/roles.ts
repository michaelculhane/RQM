'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRole(name: string, description: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .insert({ name: name.trim(), description: description.trim() || null })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin/roles')
  return { id: data.id }
}

export async function updateRole(id: string, name: string, description: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('roles')
    .update({ name: name.trim(), description: description.trim() || null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/roles')
  revalidatePath(`/admin/roles/${id}`)
  return { success: true }
}

export async function deleteRole(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/roles')
  return { success: true }
}

export async function addTeamRole(roleId: string, teamId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('team_roles')
    .insert({ role_id: roleId, team_id: teamId })
  if (error) return { error: error.message }
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

export async function removeTeamRole(roleId: string, teamId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('team_roles')
    .delete()
    .eq('role_id', roleId)
    .eq('team_id', teamId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

export async function addPermission(
  roleId: string,
  tableName: string,
  canRead: boolean,
  canCreate: boolean,
  canUpdate: boolean,
  canDelete: boolean,
  statusIn: string[] | null,
  serviceSlug: string | null,
  openedBySelf: boolean,
) {
  const supabase = createClient()
  const { error } = await supabase.from('role_permissions').insert({
    role_id: roleId,
    table_name: tableName,
    can_read: canRead,
    can_create: canCreate,
    can_update: canUpdate,
    can_delete: canDelete,
    status_in: statusIn,
    service_slug: serviceSlug || null,
    opened_by_self: openedBySelf,
  })
  if (error) return { error: error.message }
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

export async function addUserRole(userId: string, roleId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profile_roles')
    .insert({ profile_id: userId, role_id: roleId })
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function removeUserRole(userId: string, roleId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profile_roles')
    .delete()
    .eq('profile_id', userId)
    .eq('role_id', roleId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deletePermission(id: string, roleId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('role_permissions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/roles/${roleId}`)
  return { success: true }
}

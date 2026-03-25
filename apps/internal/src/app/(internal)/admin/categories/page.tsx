import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateCategoryForm from '@/components/admin/CreateCategoryForm'
import CategoryList from '@/components/admin/CategoryList'
import type { Category } from '@/lib/types'

export default async function AdminCategoriesPage() {
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

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the categories that services are organized into.
        </p>
      </div>

      <div className="space-y-6">
        <CategoryList categories={(categories ?? []) as Category[]} />
        <CreateCategoryForm />
      </div>
    </div>
  )
}

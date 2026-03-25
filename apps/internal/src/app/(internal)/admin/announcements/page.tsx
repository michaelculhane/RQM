import { createClient } from '@/lib/supabase/server'
import type { Announcement } from '@/lib/types'
import AnnouncementList from '@/components/admin/AnnouncementList'
import CreateAnnouncementForm from '@/components/admin/CreateAnnouncementForm'

export default async function AnnouncementsAdminPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('sort_order')

  const announcements = (data ?? []) as Announcement[]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the HR announcements shown on the employee portal home page.
        </p>
      </div>

      <div className="space-y-6">
        <AnnouncementList announcements={announcements} />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Announcement</h2>
          <CreateAnnouncementForm />
        </div>
      </div>
    </div>
  )
}

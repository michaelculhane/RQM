import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/ui/Nav'
import ChatWidget from '@/components/chat/ChatWidget'
import type { Profile } from '@/lib/types'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Provide a fallback profile if the DB row isn't present yet
  const safeProfile: Profile = profile ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: user.user_metadata?.full_name ?? user.email ?? 'User',
    role: 'employee',
    team_id: null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav profile={safeProfile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}

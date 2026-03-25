'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'
import type { Profile } from '@/lib/types'

interface NavLink {
  href: string
  label: string
  badge?: number | null
  exact?: boolean
}

interface NavProps {
  profile: Profile
  openTaskCount: number
}

export default function Nav({ profile, openTaskCount }: NavProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/home',      label: 'Home',         exact: true },
    { href: '/services',  label: 'Services' },
    { href: '/requests',  label: 'My Requests' },
    { href: '/tasks',     label: 'My Tasks', badge: openTaskCount > 0 ? openTaskCount : null },
    { href: '/knowledge', label: 'Knowledge Base' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/home" className="flex flex-col items-center">
              <img src="/logo.png" alt="Office of Human Capital" className="h-10 w-auto" />
              <span className="text-[10px] font-semibold text-brand-700 uppercase tracking-widest leading-none mt-1">Employee Portal</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                    {link.badge != null && (
                      <span className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full bg-brand-600 text-white text-[10px] font-bold px-1">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{profile.full_name}</span>
            <form action={logout} className="flex items-center">
              <button
                type="submit"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex sm:hidden gap-1 pb-3">
          {navLinks.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
                {link.badge != null && (
                  <span className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full bg-brand-600 text-white text-[10px] font-bold px-1">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

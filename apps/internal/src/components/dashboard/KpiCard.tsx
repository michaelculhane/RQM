import Link from 'next/link'

interface KpiCardProps {
  label: string
  count: number
  href: string
  colorClass: string
  bgClass: string
}

export default function KpiCard({ label, count, href, colorClass, bgClass }: KpiCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-3 text-4xl font-bold tabular-nums ${colorClass} group-hover:scale-105 inline-block transition-transform origin-left`}>
        {count}
      </p>
      <div className={`mt-3 h-1 rounded-full ${bgClass} opacity-40`} />
    </Link>
  )
}

'use client'
import { useState } from 'react'
import RequestRow from './RequestRow'
import type { Request } from '@/lib/types'

type SortKey = 'service' | 'employee' | 'status' | 'priority' | 'team' | 'opened_at' | 'assigned_to'
type SortDir = 'asc' | 'desc'

const PRIORITY_RANK: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const STATUS_RANK: Record<string, number> = {
  open: 1,
  in_progress: 2,
  pending_employee: 3,
  resolved: 4,
  closed: 5,
}

function getValue(request: Request, key: SortKey): string | number {
  switch (key) {
    case 'service':     return request.services?.name?.toLowerCase() ?? ''
    case 'employee':    return request.opener?.full_name?.toLowerCase() ?? ''
    case 'status':      return STATUS_RANK[request.status] ?? 0
    case 'priority':    return PRIORITY_RANK[request.priority] ?? 0
    case 'team':        return request.teams?.name?.toLowerCase() ?? ''
    case 'opened_at':   return request.opened_at ?? ''
    case 'assigned_to': return request.assignee?.full_name?.toLowerCase() ?? ''
  }
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px">
      <svg
        className={`w-2.5 h-2.5 transition-colors ${active && dir === 'asc' ? 'text-slate-800' : 'text-gray-300'}`}
        viewBox="0 0 10 6" fill="currentColor"
      >
        <path d="M5 0L10 6H0L5 0Z" />
      </svg>
      <svg
        className={`w-2.5 h-2.5 transition-colors ${active && dir === 'desc' ? 'text-slate-800' : 'text-gray-300'}`}
        viewBox="0 0 10 6" fill="currentColor"
      >
        <path d="M5 6L0 0H10L5 6Z" />
      </svg>
    </span>
  )
}

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: null,          label: 'ID' },
  { key: 'service',     label: 'Service' },
  { key: 'employee',    label: 'Employee' },
  { key: 'status',      label: 'Status' },
  { key: 'priority',    label: 'Priority' },
  { key: 'team',        label: 'Team' },
  { key: 'opened_at',   label: 'Opened' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: null,          label: '' },
]

interface QueueTableProps {
  requests: Request[]
}

export default function QueueTable({ requests }: QueueTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('opened_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...requests].sort((a, b) => {
    const av = getValue(a, sortKey)
    const bv = getValue(b, sortKey)
    let cmp = 0
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv
    } else {
      cmp = String(av).localeCompare(String(bv))
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  if (requests.length === 0) {
    return (
      <div className="px-8 py-16 text-center">
        <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="mt-3 text-sm text-gray-500">No requests found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map((col, i) =>
              col.key ? (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => handleSort(col.key!)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-flex items-center gap-0.5">
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </span>
                </th>
              ) : (
                <th
                  key={i}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sorted.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

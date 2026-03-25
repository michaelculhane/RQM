'use client'

import { useState } from 'react'
import type { Announcement } from '@/lib/types'
import { toggleAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/actions/announcements'

const THEMES = [
  { value: 'blue',   label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'green',  label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal',   label: 'Teal' },
  { value: 'slate',  label: 'Slate' },
  { value: 'rose',   label: 'Rose' },
]

const THEME_DOT: Record<string, string> = {
  blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-emerald-500',
  orange: 'bg-orange-500', teal: 'bg-teal-500', slate: 'bg-slate-500', rose: 'bg-rose-500',
}

function AnnouncementRow({ ann }: { ann: Announcement }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(ann.title)
  const [body, setBody] = useState(ann.body ?? '')
  const [imageUrl, setImageUrl] = useState(ann.image_url ?? '')
  const [colorTheme, setColorTheme] = useState(ann.color_theme)
  const [ctaLabel, setCtaLabel] = useState(ann.cta_label ?? '')
  const [ctaUrl, setCtaUrl] = useState(ann.cta_url ?? '')

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  async function handleSave() {
    if (!title.trim()) return
    setBusy(true)
    setError(null)
    const result = await updateAnnouncement(ann.id, {
      title, body, image_url: imageUrl, color_theme: colorTheme,
      cta_label: ctaLabel, cta_url: ctaUrl, is_active: ann.is_active,
    })
    if (result?.error) {
      setError(result.error)
      setBusy(false)
      return
    }
    setEditing(false)
    setBusy(false)
  }

  async function handleToggle() {
    setBusy(true)
    await toggleAnnouncement(ann.id, !ann.is_active)
    setBusy(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this announcement?')) return
    setBusy(true)
    await deleteAnnouncement(ann.id)
    setBusy(false)
  }

  if (editing) {
    return (
      <tr className={busy ? 'opacity-50' : ''}>
        <td colSpan={4} className="px-5 py-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Color Theme</label>
                <select value={colorTheme} onChange={(e) => setColorTheme(e.target.value)} className={inputClass}>
                  {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL <span className="text-gray-400">(overrides theme)</span></label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CTA Label</label>
                <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Learn More" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CTA URL</label>
                <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/knowledge" className={inputClass} />
              </div>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={busy || !title.trim()}
                className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setError(null) }}
                disabled={busy}
                className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className={busy ? 'opacity-50' : ''}>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800">{ann.title}</p>
        {ann.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ann.body}</p>}
        {ann.cta_label && <p className="text-xs text-brand-500 mt-0.5">CTA: {ann.cta_label} → {ann.cta_url}</p>}
      </td>
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${THEME_DOT[ann.color_theme] ?? 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600 capitalize">{ann.color_theme}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={handleToggle}
          disabled={busy}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            ann.is_active
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {ann.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            className="text-xs text-brand-600 hover:text-brand-800 transition-colors disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-400 italic">
        No announcements yet. Create one below.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Announcement</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Theme</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {announcements.map((ann) => (
            <AnnouncementRow key={ann.id} ann={ann} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createAnnouncement } from '@/actions/announcements'

const THEMES = [
  { value: 'blue',   label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'green',  label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal',   label: 'Teal' },
  { value: 'slate',  label: 'Slate' },
  { value: 'rose',   label: 'Rose' },
]

export default function CreateAnnouncementForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [colorTheme, setColorTheme] = useState('blue')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    const result = await createAnnouncement({ title, body, image_url: imageUrl, color_theme: colorTheme, cta_label: ctaLabel, cta_url: ctaUrl })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setTitle(''); setBody(''); setImageUrl(''); setColorTheme('blue'); setCtaLabel(''); setCtaUrl('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Open Enrollment Now Open" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Optional subtitle or description." className={`${inputClass} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CTA Button Label</label>
          <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Learn More" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CTA URL</label>
          <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/knowledge" className={inputClass} />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating…' : 'Create Announcement'}
        </button>
      </div>
    </form>
  )
}

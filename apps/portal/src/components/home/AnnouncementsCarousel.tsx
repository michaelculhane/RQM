'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { Announcement } from '@/lib/types'

const THEMES: Record<string, string> = {
  blue:   'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  purple: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)',
  green:  'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
  orange: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)',
  teal:   'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)',
  slate:  'linear-gradient(135deg, #1e293b 0%, #64748b 100%)',
  rose:   'linear-gradient(135deg, #9f1239 0%, #fb7185 100%)',
}

export default function AnnouncementsCarousel({ announcements }: { announcements: Announcement[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = announcements.length

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count)
  }, [count])

  useEffect(() => {
    if (paused || count <= 1) return
    timerRef.current = setInterval(advance, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advance, paused, count])

  if (count === 0) return null

  const slide = announcements[current]
  const bg = slide.image_url
    ? undefined
    : (THEMES[slide.color_theme] ?? THEMES.blue)

  return (
    <div
      className="relative overflow-hidden rounded-2xl select-none"
      style={{ height: '280px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)`, width: `${count * 100}%` }}
      >
        {announcements.map((ann) => {
          const slideBg = ann.image_url
            ? undefined
            : (THEMES[ann.color_theme] ?? THEMES.blue)
          return (
            <div
              key={ann.id}
              className="relative flex-shrink-0 h-full flex items-end"
              style={{
                width: `${100 / count}%`,
                background: slideBg,
              }}
            >
              {/* Background image */}
              {ann.image_url && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${ann.image_url})` }}
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-8 pb-10 w-full">
                <h2 className="text-2xl font-bold text-white leading-tight max-w-xl">
                  {ann.title}
                </h2>
                {ann.body && (
                  <p className="mt-2 text-sm text-white/80 max-w-lg leading-relaxed line-clamp-2">
                    {ann.body}
                  </p>
                )}
                {ann.cta_label && ann.cta_url && (
                  <Link
                    href={ann.cta_url}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-4 py-1.5 text-sm font-medium text-white transition-colors"
                  >
                    {ann.cta_label}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={advance}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

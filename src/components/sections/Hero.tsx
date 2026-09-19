'use client'

import { useEffect, useState } from 'react'

const SUBJECTS = ['MA101', 'PH101', 'CS101', 'HSS', 'PE']

interface HeroProps {
  onBlueprintOpen?: () => void
  onCalendarOpen?: () => void
}

export default function Hero({ onBlueprintOpen, onCalendarOpen }: HeroProps) {
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    setDateStr(`${day} · ${date}`)
  }, [])

  return (
    <section className="w-full">
      {/* Header bar */}
      <div className="w-full bg-[var(--glass-1)] backdrop-blur-[11px] border-b border-[var(--glass-border)]">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-white font-bold tracking-wider text-sm sm:text-base">
            NEO LIFE OS
          </span>
          <span className="text-[var(--t2)] text-xs sm:text-sm">{dateStr}</span>
        </div>
      </div>

      {/* Subject pills + quick-launch buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((subject) => (
            <span
              key={subject}
              className="bg-[var(--glass-1)] border border-[var(--glass-border)] text-[var(--t2)] text-xs px-2.5 py-1 rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onBlueprintOpen}
            className="bg-[var(--glass-1)] border border-[var(--glass-border)] text-[var(--t2)] text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors hover:border-[var(--accent)] hover:text-white"
          >
            🏛 Blueprint
          </button>
          <button
            onClick={onCalendarOpen}
            className="bg-[var(--glass-1)] border border-[var(--glass-border)] text-[var(--t2)] text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors hover:border-[var(--accent)] hover:text-white"
          >
            📅 Weekly Architecture
          </button>
        </div>
      </div>
    </section>
  )
}

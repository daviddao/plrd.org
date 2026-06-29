'use client'

import { useState } from 'react'
import Link from 'next/link'

export type InsightTile = {
  key: string
  href: string
  eyebrow?: string
  title: string
  description?: string
  external?: boolean
}

export type InsightSection = {
  key: string
  label: string
  heading: string
  allHref: string
  allLabel: string
  count: number
  items: InsightTile[]
}

const ALL = 'all'

export default function InsightsExplorer({ sections }: { sections: InsightSection[] }) {
  const [active, setActive] = useState<string>(ALL)

  const filters = [
    { key: ALL, label: 'All', count: null as number | null },
    ...sections.map((s) => ({ key: s.key, label: s.label, count: s.count })),
  ]
  const visible = sections.filter((s) => active === ALL || s.key === active)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap items-end gap-x-7 gap-y-1 border-b border-gray-200 mb-12">
        {filters.map((f) => {
          const isActive = active === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              aria-pressed={isActive}
              className={`relative -mb-px pb-3 text-[15px] cursor-pointer transition-colors ${
                isActive ? 'text-black font-medium' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {f.label}
              {typeof f.count === 'number' && (
                <span className="ml-1.5 text-xs text-gray-400">{f.count}</span>
              )}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue" />}
            </button>
          )
        })}
      </div>

      {/* Filtered sections */}
      {visible.map((section, i) => (
        <div
          key={section.key}
          className={i < visible.length - 1 ? 'mb-12 pb-12 border-b border-gray-100' : 'mb-4'}
        >
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">{section.heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.items.map(({ key, ...tile }) => (
              <RecentTile key={key} {...tile} />
            ))}
          </div>
          <Link href={section.allHref} className="text-base text-blue hover:underline mt-8 inline-block">
            {section.allLabel}
          </Link>
        </div>
      ))}
    </div>
  )
}

function RecentTile({
  href,
  eyebrow,
  title,
  description,
  external,
}: Omit<InsightTile, 'key'>) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex flex-col h-full border border-gray-200 rounded-lg p-5 hover:border-blue hover:shadow-sm transition-all"
    >
      {eyebrow && <div className="text-xs text-gray-400 mb-2">{eyebrow}</div>}
      <h3 className="text-base font-medium text-black leading-snug group-hover:text-blue transition-colors">
        {title}
        {external && <span className="text-gray-400 text-xs ml-1.5">↗</span>}
      </h3>
      {description && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{description}</p>}
    </Link>
  )
}

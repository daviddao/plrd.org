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
  areas: string[]
}

export type InsightSection = {
  key: string
  label: string
  heading: string
  allHref: string
  allLabel: string
  items: InsightTile[]
}

export type AreaDef = { slug: string; title: string }

const ALL = 'all'
const DISPLAY_LIMIT = 9

export default function InsightsExplorer({
  sections,
  areas,
}: {
  sections: InsightSection[]
  areas: AreaDef[]
}) {
  const [type, setType] = useState<string>(ALL)
  const [area, setArea] = useState<string>(ALL)

  const matchArea = (tile: InsightTile, a: string) => a === ALL || tile.areas.includes(a)

  // Area chip counts reflect the current TYPE selection.
  const typeScoped = sections.filter((s) => type === ALL || s.key === type).flatMap((s) => s.items)
  const areaCount = (slug: string) =>
    slug === ALL ? typeScoped.length : typeScoped.filter((t) => matchArea(t, slug)).length

  // Type tab counts reflect the current AREA selection.
  const typeCount = (key: string) => {
    const items = key === ALL ? sections.flatMap((s) => s.items) : sections.find((s) => s.key === key)?.items ?? []
    return items.filter((t) => matchArea(t, area)).length
  }

  const visible = sections
    .filter((s) => type === ALL || s.key === type)
    .map((s) => ({ section: s, shown: s.items.filter((t) => matchArea(t, area)) }))
    .filter((x) => x.shown.length > 0)

  const typeTabs = [{ key: ALL, label: 'All' }, ...sections.map((s) => ({ key: s.key, label: s.label }))]
  const areaChips = [{ slug: ALL, title: 'All areas' }, ...areas]
  const activeAreaTitle = areas.find((a) => a.slug === area)?.title

  return (
    <div>
      {/* Filter toolbar: focus-area chips (left) + content-type tabs (right) */}
      <div className="flex flex-col gap-4 border-b border-gray-200 mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2 pb-3">
          {areaChips.map((a) => {
            const isActive = area === a.slug
            const count = areaCount(a.slug)
            const disabled = a.slug !== ALL && count === 0
            return (
              <button
                key={a.slug}
                type="button"
                disabled={disabled}
                onClick={() => setArea(a.slug)}
                aria-pressed={isActive}
                className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-blue text-white'
                    : disabled
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {a.title}
                {a.slug !== ALL && (
                  <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-end justify-end gap-x-7 gap-y-1">
          {typeTabs.map((f) => {
            const isActive = type === f.key
            const count = typeCount(f.key)
            const disabled = f.key !== ALL && count === 0
            return (
              <button
                key={f.key}
                type="button"
                disabled={disabled}
                onClick={() => setType(f.key)}
                aria-pressed={isActive}
                className={`relative -mb-px pb-3 text-[15px] transition-colors ${
                  isActive
                    ? 'text-black font-medium'
                    : disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-700 cursor-pointer'
                }`}
              >
                {f.label}
                {f.key !== ALL && <span className="ml-1.5 text-xs text-gray-400">{count}</span>}
                {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtered sections */}
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">
            No {type === ALL ? 'items' : sections.find((s) => s.key === type)?.label.toLowerCase()}
            {activeAreaTitle ? ` tagged ${activeAreaTitle}` : ''} yet.
          </p>
          <button
            type="button"
            onClick={() => setArea(ALL)}
            className="mt-3 text-blue hover:underline text-sm cursor-pointer"
          >
            Clear area filter
          </button>
        </div>
      ) : (
        visible.map(({ section, shown }, i) => (
          <div
            key={section.key}
            className={i < visible.length - 1 ? 'mb-12 pb-12 border-b border-gray-100' : 'mb-4'}
          >
            <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">{section.heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shown.slice(0, DISPLAY_LIMIT).map(({ key, ...tile }) => (
                <RecentTile key={key} {...tile} />
              ))}
            </div>
            <Link href={section.allHref} className="text-base text-blue hover:underline mt-8 inline-block">
              {section.allLabel}
            </Link>
          </div>
        ))
      )}
    </div>
  )
}

function RecentTile({
  href,
  eyebrow,
  title,
  description,
  external,
}: Omit<InsightTile, 'key' | 'areas'>) {
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

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

  const typeTabs = [{ key: ALL, label: 'All types' }, ...sections.map((s) => ({ key: s.key, label: s.label }))]
  const areaChips = [{ slug: ALL, title: 'All areas' }, ...areas]
  const activeAreaTitle = areas.find((a) => a.slug === area)?.title

  return (
    <div>
      {/* Filter toolbar: focus-area pills | content-type pills */}
      <div className="flex flex-col gap-4 border-b border-gray-200 mb-12 pb-5 sm:flex-row sm:items-center sm:gap-0">
        {/* Focus area */}
        <div className="flex flex-wrap gap-2">
          {areaChips.map((a) => {
            const count = areaCount(a.slug)
            return (
              <Pill
                key={a.slug}
                label={a.title}
                count={a.slug === ALL ? undefined : count}
                active={area === a.slug}
                disabled={a.slug !== ALL && count === 0}
                onClick={() => setArea(a.slug)}
              />
            )
          })}
        </div>

        {/* Divider between the two filter dimensions */}
        <div className="hidden sm:block self-stretch w-px bg-gray-300 mx-5" aria-hidden="true" />
        <div className="h-px w-full bg-gray-200 sm:hidden" aria-hidden="true" />

        {/* Content type */}
        <div className="flex flex-wrap gap-2">
          {typeTabs.map((f) => {
            const count = typeCount(f.key)
            return (
              <Pill
                key={f.key}
                label={f.label}
                count={f.key === ALL ? undefined : count}
                active={type === f.key}
                disabled={f.key !== ALL && count === 0}
                onClick={() => setType(f.key)}
              />
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

function Pill({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
        active
          ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
          : disabled
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
      }`}
    >
      {label}
      {typeof count === 'number' && (
        <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>{count}</span>
      )}
    </button>
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

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import worldMap from '@/data/world-map.json'
import gainforestSites from '@/data/gainforest-sites.json'
import type { GainforestStats } from '@/lib/gainforest'
import type { MaEarthStats } from '@/lib/maearth'
import { MetricModal, TrendStat, formatCount, InfoTooltip } from '@/components/MetricTrend'
import GainforestCarousel from '@/components/GainforestCarousel'

const { width: MW, height: MH, path: WORLD } = worldMap as { width: number; height: number; path: string }

type MapPoint = {
  lat: number
  lon: number
  name: string | null
  type: string | null
  description: string | null
  image: string | null
  url: string
}
const SITES = (gainforestSites as { points: MapPoint[] }).points

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Map — dependency-free equirectangular SVG (basemap from world-map.json)
// ---------------------------------------------------------------------------

function project(p: MapPoint): { x: number; y: number } {
  return { x: ((p.lon + 180) / 360) * MW, y: ((90 - p.lat) / 180) * MH }
}

function SitesMap({ points }: { points: MapPoint[] }) {
  const [active, setActive] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActive(i)
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActive(null), 140)
  }
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  const focused = active !== null ? points[active] : null
  const fp = focused ? project(focused) : null
  // Keep the card inside the frame horizontally (it's ~`w-60` wide).
  const leftPct = fp ? Math.min(89, Math.max(11, (fp.x / MW) * 100)) : 0
  const topPct = fp ? (fp.y / MH) * 100 : 0

  return (
    <div className="relative w-full" style={{ aspectRatio: `${MW} / ${MH}` }}>
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        <svg viewBox={`0 0 ${MW} ${MH}`} className="w-full h-full">
          <path d={WORLD} fill="#e7eaee" stroke="#d4d9df" strokeWidth={0.5} />
          {points.map((p, i) => {
            const { x, y } = project(p)
            const on = active === i
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={on ? 6 : 3.6}
                fill="var(--color-pink, #E51A66)"
                fillOpacity={on ? 1 : 0.8}
                stroke="#fff"
                strokeWidth={1}
                className="cursor-pointer transition-all"
                onMouseEnter={() => open(i)}
                onMouseLeave={scheduleClose}
              />
            )
          })}
        </svg>

        <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-pink, #E51A66)' }} />
          {formatCount(points.length)} certified orgs mapped
        </div>
      </div>

      {focused && fp && (
        <div
          className="absolute z-20 w-60 -translate-x-1/2 -translate-y-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-xl"
          style={{ left: `${leftPct}%`, top: `${topPct}%`, marginTop: -10 }}
          onMouseEnter={() => open(active as number)}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-start gap-3">
            {focused.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={focused.image}
                alt=""
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 bg-gray-100 object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-black leading-snug">
                {focused.name || 'Certified organization'}
              </div>
              {focused.type && (
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-gray-400">{focused.type}</div>
              )}
            </div>
          </div>
          {focused.description && (
            <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-4">{focused.description}</p>
          )}
          <a
            href={focused.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue hover:underline"
          >
            View project
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const BLUE = 'var(--color-blue, #1982F4)'
const PINK = 'var(--color-pink, #E51A66)'
const TEAL = 'var(--color-teal, #12bfdf)'

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

type HcKey = 'certifiedOrgs' | 'bumicerts'

export default function GainforestImpact({
  stats,
  maearth,
}: {
  stats: GainforestStats
  maearth: MaEarthStats
}) {
  const [active, setActive] = useState<HcKey | null>(null)
  const [obsOpen, setObsOpen] = useState(false)
  const obsSeries = stats.trends.observations
  const obsHasTrend = obsSeries.values.length > 1

  const metrics = useMemo(
    () => [
      {
        key: 'certifiedOrgs' as const,
        label: 'Certified organizations',
        caption: 'GainForest actor orgs',
        color: PINK,
        value: stats.certifiedOrgs,
      },
      {
        key: 'bumicerts' as const,
        label: 'Hypercerts',
        caption: 'Impact claims created',
        color: BLUE,
        value: stats.bumicerts,
      },
    ],
    [stats],
  )
  const activeMeta = active ? metrics.find((m) => m.key === active) ?? null : null

  return (
    <div className="mb-16 pb-14 border-b border-gray-100">
      <h2 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
        <span className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/partner-logos/hypercerts.png" alt="Hypercerts" className="h-5 w-5 object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/partner-logos/maearth.png" alt="Ma Earth" className="h-5 w-5 object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/partner-logos/gainforest.png" alt="GainForest" className="h-5 w-5 object-contain" />
        </span>
        Environmental Hypercerts
        <InfoTooltip
          label="About Environmental Hypercerts"
          text="Impact certificates (hypercerts) and certified conservation organizations in the GainForest commons, plus the Ma Earth quadratic-funding matching pool. Read live from GainForest's Hypercerts Indexer."
        />
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-10 mb-10">
        {metrics.map((m) => (
          <TrendStat
            key={m.key}
            label={m.label}
            value={m.value}
            caption={m.caption}
            format={formatCount}
            series={stats.trends[m.key]}
            color={m.color}
            onExpand={() => setActive(m.key)}
          />
        ))}
        {/* Live Ma Earth crowdfunding donations across all round projects. */}
        <a
          href="https://maearth.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          title={`Ma Earth ${maearth.round} — live crowdfunding donations across all projects`}
        >
          <TrendStat
            label={`${maearth.round} donations`}
            value={maearth.donations}
            caption={
              maearth.degraded
                ? 'Ma Earth ↗'
                : `${formatCount(maearth.projects)} projects · Ma Earth ↗`
            }
            format={formatUsd}
            color={PINK}
          />
        </a>
        {/* Live Ma Earth donor count across all round projects. */}
        <a
          href="https://maearth.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          title={`Ma Earth ${maearth.round} — donors across all projects`}
        >
          <TrendStat
            label={`${maearth.round} donors`}
            value={maearth.donors}
            caption={`Ma Earth ${maearth.round} ↗`}
            format={formatCount}
            color={BLUE}
          />
        </a>
        {/* Ma Earth quadratic-funding matching pool. */}
        <a
          href="https://maearth.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          title={`Ma Earth ${maearth.round} quadratic-funding matching pool`}
        >
          <TrendStat
            label="QF matching pool"
            value={maearth.matchingPool}
            caption={`Ma Earth ${maearth.round} ↗`}
            format={formatUsd}
            color={TEAL}
          />
        </a>
      </div>

      {SITES.length > 0 && <SitesMap points={SITES} />}

      <p className="mt-6 text-xs text-gray-400">
        Live data from{' '}
        <a href="https://gainforest.earth" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
          GainForest
        </a>
        ’s Hypercerts Indexer; the map shows certified organization locations
        {stats.degraded && ' · counts temporarily unavailable'}.
      </p>

      {/* Live carousel of the most recent biodiversity data collections
          (Darwin Core occurrence records with field photos), fetched
          dynamically from the GainForest indexer in the browser. The total
          species-observation count + recent-activity tail (newest 1,000
          records) sits on top, mirroring the gainforest-explorer landing band. */}
      <div className="mt-12">
        <h3 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/partner-logos/gainforest.png" alt="GainForest" className="h-5 w-5 object-contain" />
          Biodiversity Data — GainForest
          <InfoTooltip
            label="About Biodiversity Data"
            text="Darwin Core species-occurrence records contributed by certified field organizations — the living biodiversity dataset underpinning GainForest's nature-finance work."
          />
        </h3>
        <div className="mb-8 max-w-xs">
          <TrendStat
            label="Species observations"
            value={stats.observations}
            caption="Darwin Core occurrence records · recent activity"
            format={formatCount}
            series={obsSeries}
            color={TEAL}
            minBaseline
            onExpand={obsHasTrend ? () => setObsOpen(true) : undefined}
          />
        </div>
        <GainforestCarousel limit={100} />
        <p className="mt-6 text-xs text-gray-400">
          Live data from{' '}
          <a href="https://gainforest.earth" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
            GainForest.Earth
          </a>
          .
        </p>
      </div>

      {activeMeta && (
        <MetricModal
          title={activeMeta.label}
          caption={activeMeta.caption}
          series={stats.trends[activeMeta.key]}
          color={activeMeta.color}
          format={formatCount}
          onClose={() => setActive(null)}
        />
      )}

      {obsOpen && obsHasTrend && (
        <MetricModal
          title="Species observations"
          caption="Cumulative occurrence records — recent activity (newest 1,000) anchored to the live total"
          series={obsSeries}
          color={TEAL}
          format={formatCount}
          minBaseline
          onClose={() => setObsOpen(false)}
        />
      )}
    </div>
  )
}

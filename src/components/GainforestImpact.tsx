'use client'

import { useEffect, useRef, useState } from 'react'
import worldMap from '@/data/world-map.json'
import gainforestSites from '@/data/gainforest-sites.json'
import type { GainforestStats } from '@/lib/gainforest'

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

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

/** Animate a number from 0 → target with ease-out cubic. */
function useCountUp(target: number, duration = 900): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (target <= 0) {
      setV(0)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setV(Math.round((1 - Math.pow(1 - t, 3)) * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

function Stat({ label, value, caption }: { label: string; value: number; caption?: string }) {
  const animated = useCountUp(value)
  return (
    <div>
      <div className="text-2xl lg:text-3xl font-semibold text-black mb-2 tabular-nums">
        {formatCount(animated)}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {caption && <div className="text-xs text-gray-400 mt-1">{caption}</div>}
    </div>
  )
}

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

export default function GainforestImpact({ stats }: { stats: GainforestStats }) {
  return (
    <div className="mb-16 pb-14 border-b border-gray-100">
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
        Environmental Hypercerts
      </h2>

      <div className="grid grid-cols-2 gap-y-8 gap-x-8 mb-10 max-w-lg">
        <Stat label="Certified organizations" value={stats.certifiedOrgs} caption="On-chain actor orgs" />
        <Stat label="Bumicerts" value={stats.bumicerts} caption="Impact claims (hypercerts) created" />
      </div>

      {SITES.length > 0 && <SitesMap points={SITES} />}

      <p className="mt-6 text-xs text-gray-400">
        Live data from{' '}
        <a href="https://gainforest.earth" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
          GainForest
        </a>{' '}
        · counts via the Hyperindex AT Protocol indexer; the map shows certified
        organization locations
        {stats.degraded && ' · counts temporarily unavailable'}.
      </p>
    </div>
  )
}

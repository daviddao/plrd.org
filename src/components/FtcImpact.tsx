'use client'

import { useMemo, useState } from 'react'
import type { FtcMetricKey, FtcStats } from '@/lib/ftc'
import { MetricModal, TrendStat, formatCount, formatUsd } from '@/components/MetricTrend'

// ---------------------------------------------------------------------------
// Funding the Commons — public-goods funding + program reach. Mirrors the
// Glow / GainForest bands: headline TrendStat cards backed by a dated series
// the user can expand. Data is read from the PL Research indexer, which mirrors
// FtC's io.fundingthecommons.impact.* records (see src/lib/ftc.ts).
// ---------------------------------------------------------------------------

const BLUE = 'var(--color-blue, #1982F4)'
const PINK = 'var(--color-pink, #E51A66)'
const TEAL = 'var(--color-teal, #18A999)'

type Meta = {
  key: FtcMetricKey
  label: string
  caption: string
  color: string
  format: (n: number) => string
  minBaseline: boolean
}

const METRICS: Meta[] = [
  { key: 'pgfDistributed', label: 'Public-goods funding', caption: 'Distributed to builders · USD', color: TEAL, format: formatUsd, minBaseline: false },
  { key: 'alumniFollowOn', label: 'Alumni follow-on', caption: 'Capital residency alumni raised', color: PINK, format: formatUsd, minBaseline: false },
  { key: 'totalAudience', label: 'Community', caption: 'Across FtC public channels', color: BLUE, format: formatCount, minBaseline: true },
  { key: 'residencyBuilders', label: 'Residency builders', caption: 'Hosted across all cohorts', color: BLUE, format: formatCount, minBaseline: true },
  { key: 'hackathonBuilders', label: 'Hackathon builders', caption: 'Across hackathons run', color: PINK, format: formatCount, minBaseline: true },
  { key: 'hackathonProjects', label: 'Projects shipped', caption: 'Hackathon prototypes', color: TEAL, format: formatCount, minBaseline: true },
]

export default function FtcImpact({ stats }: { stats: FtcStats }) {
  const [active, setActive] = useState<FtcMetricKey | null>(null)
  const activeMeta = useMemo(
    () => (active ? METRICS.find((m) => m.key === active) ?? null : null),
    [active],
  )

  if (stats.degraded) {
    return (
      <div className="mb-16 pb-14 border-b border-gray-100">
        <h2 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/partner-logos/ftc.png" alt="Funding the Commons" className="h-5 w-5 object-contain rounded" />
          Public Goods Funding — Funding the Commons
        </h2>
        <p className="text-sm text-gray-500">
          FtC impact metrics are temporarily unavailable. Try refreshing in a minute.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-16 pb-14 border-b border-gray-100">
      <h2 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/partner-logos/ftc.png" alt="Funding the Commons" className="h-5 w-5 object-contain rounded" />
        Public Goods Funding — Funding the Commons
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-8 mb-8 max-w-2xl">
        {METRICS.map((m) => (
          <TrendStat
            key={m.key}
            label={m.label}
            value={stats.totals[m.key]}
            caption={m.caption}
            format={m.format}
            series={stats.trends[m.key]}
            color={m.color}
            minBaseline={m.minBaseline}
            onExpand={() => setActive(m.key)}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Public-goods funding facilitated, residencies and hackathons, read live
        from{' '}
        <a
          href="https://ftc-impact-dashboard.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          Funding the Commons
        </a>
        ’s signed impact records
        {stats.asOf ? ` (as of ${stats.asOf})` : ''}.
      </p>

      {activeMeta && (
        <MetricModal
          title={activeMeta.label}
          caption={`${activeMeta.label} over time, read from FtC’s impact records`}
          series={stats.trends[activeMeta.key]}
          color={activeMeta.color}
          format={activeMeta.format}
          minBaseline={activeMeta.minBaseline}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

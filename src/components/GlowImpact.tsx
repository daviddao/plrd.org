'use client'

import { useMemo, useState } from 'react'
import type { GlowStats } from '@/lib/glow'
import { MetricModal, TrendStat, formatCount } from '@/components/MetricTrend'

// ---------------------------------------------------------------------------
// Glow protocol — weekly solar-farm activity. Mirrors GainforestImpact: three
// headline metrics (latest audited week) each backed by a rolling weekly
// activity series the user can expand into a full line graph.
// ---------------------------------------------------------------------------

const BLUE = 'var(--color-blue, #1982F4)'
const PINK = 'var(--color-pink, #E51A66)'
const TEAL = 'var(--color-teal, #12bfdf)'

type GlowKey = 'powerOutput' | 'carbon' | 'activeFarms'

const formatKwh = (n: number) => Math.round(n).toLocaleString('en-US')
const formatCarbon = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 1 })

export default function GlowImpact({ stats }: { stats: GlowStats }) {
  const [active, setActive] = useState<GlowKey | null>(null)

  const metrics = useMemo(
    () => [
      {
        key: 'powerOutput' as const,
        label: 'Power output',
        caption: 'kWh · latest protocol week',
        color: BLUE,
        value: stats.powerOutput,
        format: formatKwh,
        minBaseline: false,
      },
      {
        key: 'carbon' as const,
        label: 'Carbon offset',
        caption: 'Metric tons CO₂ · latest week',
        color: PINK,
        value: stats.carbon,
        format: formatCarbon,
        minBaseline: false,
      },
      {
        key: 'activeFarms' as const,
        label: 'Active solar farms',
        caption: 'Reporting this week',
        color: TEAL,
        value: stats.activeFarms,
        format: formatCount,
        minBaseline: true,
      },
    ],
    [stats],
  )
  const activeMeta = active ? metrics.find((m) => m.key === active) ?? null : null

  return (
    <div className="mb-16 pb-14 border-b border-gray-100">
      <h2 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/partner-logos/glow.png" alt="Glow" className="h-5 w-5 object-contain" />
        Solar Energy — Glow Protocol
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-10 mb-8">
        {metrics.map((m) => (
          <TrendStat
            key={m.key}
            label={m.label}
            value={m.value}
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
        Weekly performance from{' '}
        <a
          href="https://glow.org/weekly-reports?selectedDataType=watts"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          Glow
        </a>
        ’s global solar-farm network (protocol week {stats.week})
        {stats.degraded && ' · data temporarily unavailable'}.
      </p>

      {activeMeta && (
        <MetricModal
          title={activeMeta.label}
          caption={`Weekly ${activeMeta.label.toLowerCase()} across the last ${
            stats.trends[activeMeta.key].values.length
          } protocol weeks`}
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

'use client'

import { useMemo, useState } from 'react'
import type { SimocracyTotals, SimocracyTrends } from '@/lib/simocracy'
import { MetricModal, TrendStat, formatCount, formatUsd } from '@/components/MetricTrend'

type Props = {
  totals: SimocracyTotals
  trends: SimocracyTrends
  fetchedAt: string
  degraded: boolean
}


const BLUE = 'var(--color-blue, #1982F4)'
const PINK = 'var(--color-pink, #E51A66)'
const TEAL = 'var(--color-teal, #18A999)'

type MetricKey = keyof SimocracyTrends

type MetricMeta = {
  key: MetricKey
  label: string
  caption: string
  color: string
  value: number
  format: (n: number) => string
}

export default function SimocracyDashboard({
  totals,
  trends,
  fetchedAt,
  degraded,
}: Props) {
  const [active, setActive] = useState<MetricKey | null>(null)

  const metrics: MetricMeta[] = useMemo(
    () => [
      { key: 'treasuryUsd', label: 'Treasury governed', caption: 'Gathering treasuries + FtC SF tower', color: TEAL, value: totals.treasuryUsd, format: formatUsd },
      { key: 'uniqueHumans', label: 'Voices', caption: 'Unique humans active', color: PINK, value: totals.uniqueHumans, format: formatCount },
      { key: 'totalSims', label: 'Sims', caption: 'AI agents minted', color: BLUE, value: totals.totalSims, format: formatCount },
      { key: 'totalGatherings', label: 'Gatherings', caption: 'Events & councils convened', color: BLUE, value: totals.totalGatherings, format: formatCount },
      { key: 'totalSProcesses', label: 'S-Processes', caption: 'Multi-agent deliberations', color: PINK, value: totals.totalSProcesses, format: formatCount },
      { key: 'totalChats', label: 'Chats', caption: 'Messages exchanged with sims', color: TEAL, value: totals.totalChats, format: formatCount },
    ],
    [totals],
  )

  const activeMeta = active ? metrics.find((m) => m.key === active) ?? null : null

  const fetchedLabel = useMemo(() => {
    try {
      return new Date(fetchedAt).toLocaleString()
    } catch {
      return fetchedAt
    }
  }, [fetchedAt])

  if (degraded) {
    return (
      <div className="py-12 text-sm text-gray-500">
        The Simocracy indexer is currently unreachable. Try refreshing in a minute.
      </div>
    )
  }

  return (
    <div>
      {/* Headline numbers — same constrained TrendStat grid as the partner
          sections above (max-w-2xl, sm:grid-cols-3) so the figures line up. */}
      <h2 className="flex items-center gap-2.5 text-sm text-gray-500 uppercase tracking-wide mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/partner-logos/simocracy.png" alt="Simocracy" className="h-5 w-5 object-contain" />
        Governance — Simocracy
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-8 mb-8 max-w-2xl">
        {metrics.map((m) => (
          <TrendStat
            key={m.key}
            label={m.label}
            value={m.value}
            caption={m.caption}
            format={m.format}
            series={trends[m.key]}
            color={m.color}
            onExpand={() => setActive(m.key)}
          />
        ))}
      </div>

      {activeMeta && (
        <MetricModal
          title={activeMeta.label}
          caption={activeMeta.caption}
          series={trends[activeMeta.key]}
          color={activeMeta.color}
          format={activeMeta.format}
          onClose={() => setActive(null)}
        />
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400">
        Tap any metric to expand its trend · live from{' '}
        <a
          href="https://simocracy.org/stats"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          simocracy.org
        </a>{' '}
        · refreshed {fetchedLabel} · cached 60s.
      </p>
    </div>
  )
}

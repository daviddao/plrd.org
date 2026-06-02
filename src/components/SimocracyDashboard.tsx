'use client'

import { useMemo, useState } from 'react'
import type { ActivityBucket, SimocracyTotals, SimocracyTrends } from '@/lib/simocracy'
import { MetricModal, TrendStat, formatCount } from '@/components/MetricTrend'

type Props = {
  totals: SimocracyTotals
  trends: SimocracyTrends
  pulse14d: ActivityBucket[]
  fetchedAt: string
  degraded: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

// ---------------------------------------------------------------------------
// 14-day pulse — interactive bar chart
// ---------------------------------------------------------------------------

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateLong(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function Pulse14d({ buckets }: { buckets: ActivityBucket[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const total = buckets.reduce((s, b) => s + b.count, 0)
  const totalChats = buckets.reduce((s, b) => s + b.chats, 0)
  const totalSprocess = buckets.reduce((s, b) => s + b.sprocess, 0)
  const max = Math.max(1, ...buckets.map((b) => b.count))

  const focused = hoverIdx !== null ? buckets[hoverIdx] : null

  // Day-label cadence: show every other day on small viewports we already
  // truncate via Tailwind, so just emit all labels and let CSS hide them.
  // We highlight the first, the middle, and "today" so even on mobile the
  // axis stays legible.
  const labelSet = new Set<number>([0, 7, buckets.length - 1])

  return (
    <div className="mt-12">
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-5">
        14-day activity
      </h2>
      <div className="flex items-baseline gap-6 mb-6 flex-wrap">
        <div>
          <div className="text-2xl lg:text-3xl font-semibold text-black tabular-nums">
            {formatCount(total)}
          </div>
          <div className="text-sm text-gray-500">events in the last fortnight</div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <LegendDot color="var(--color-blue, #1982F4)" />
          <span className="tabular-nums">
            {formatCount(totalChats)} chats
          </span>
          <span className="text-gray-300">·</span>
          <LegendDot color="var(--color-pink, #E51A66)" />
          <span className="tabular-nums">
            {formatCount(totalSprocess)} S-Processes
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div
          className="flex items-end gap-1.5 h-40 select-none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {buckets.map((b, i) => {
            const ratio = b.count / max
            // Visible track height (always ~1px for empty days so the rhythm
            // of the axis is preserved even when nothing happened).
            const visualPct = b.count === 0 ? 1 : Math.max(4, ratio * 100)
            const chatPct = b.count > 0 ? (b.chats / b.count) * 100 : 0
            const isHovered = hoverIdx === i
            const isToday = i === buckets.length - 1
            return (
              <button
                key={b.date}
                type="button"
                onMouseEnter={() => setHoverIdx(i)}
                onFocus={() => setHoverIdx(i)}
                onBlur={() => setHoverIdx(null)}
                className="flex-1 group relative h-full flex flex-col justify-end cursor-default outline-none"
                aria-label={`${formatDateLong(b.date)}: ${b.count} events (${b.chats} chats, ${b.sprocess} S-Processes)`}
              >
                <div
                  className={`w-full rounded-t-sm overflow-hidden transition-opacity ${
                    b.count === 0
                      ? 'bg-gray-100'
                      : isHovered
                        ? 'opacity-100'
                        : hoverIdx !== null
                          ? 'opacity-50'
                          : 'opacity-100'
                  }`}
                  style={{ height: `${visualPct}%` }}
                >
                  {b.count > 0 && (
                    <>
                      {/* sprocess (top) */}
                      <div
                        className="w-full"
                        style={{
                          height: `${100 - chatPct}%`,
                          background: 'var(--color-pink, #E51A66)',
                        }}
                      />
                      {/* chats (bottom) */}
                      <div
                        className="w-full"
                        style={{
                          height: `${chatPct}%`,
                          background: 'var(--color-blue, #1982F4)',
                        }}
                      />
                    </>
                  )}
                </div>
                {isToday && (
                  <span
                    aria-hidden
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Hover tooltip — anchored over the focused bar */}
        {focused && (
          <div
            className="pointer-events-none absolute -top-2 -translate-y-full px-3 py-2 bg-black text-white rounded-md shadow-lg whitespace-nowrap text-xs z-10"
            style={{
              left: `calc(${((hoverIdx as number) + 0.5) * (100 / buckets.length)}% )`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium">{formatDateLong(focused.date)}</div>
            <div className="text-gray-300 tabular-nums">
              {focused.count} {focused.count === 1 ? 'event' : 'events'}
              {focused.count > 0 && (
                <>
                  {' '}
                  · {focused.chats} chat{focused.chats === 1 ? '' : 's'}
                  {focused.sprocess > 0 && `, ${focused.sprocess} S-Process${focused.sprocess === 1 ? '' : 'es'}`}
                </>
              )}
            </div>
          </div>
        )}

        {/* Axis labels */}
        <div className="mt-3 flex gap-1.5 text-[11px] text-gray-400 tabular-nums">
          {buckets.map((b, i) => (
            <div key={b.date} className="flex-1 text-center">
              {labelSet.has(i) ? (
                <span>
                  {i === buckets.length - 1 ? 'today' : formatDateShort(b.date)}
                </span>
              ) : (
                <span aria-hidden>·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ background: color }}
    />
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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
  pulse14d,
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
      {/* Headline numbers — clean, no card chrome, matches /impact/report-2025/ */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">
        Ecosystem snapshot
      </h2>
      <p className="text-xs text-gray-400 -mt-4 mb-6">
        Tap any metric to see its full trend.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8 pb-14 border-b border-gray-100">
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

      {/* 14-day pulse */}
      <Pulse14d buckets={pulse14d} />

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
      <p className="mt-12 text-xs text-gray-400">
        Live data from{' '}
        <a
          href="https://simocracy.org/stats"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          simocracy.org
        </a>{' '}
        · last refreshed {fetchedLabel} · cached for 60s.
      </p>
    </div>
  )
}

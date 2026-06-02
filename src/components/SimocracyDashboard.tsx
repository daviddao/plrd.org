'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  ActivityBucket,
  MetricSeries,
  SimocracyTotals,
  SimocracyTrends,
} from '@/lib/simocracy'

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

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

/** Animate a number from 0 → target with ease-out cubic. */
function useCountUp(target: number, duration = 800): number {
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
      const eased = 1 - Math.pow(1 - t, 3)
      setV(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

// ---------------------------------------------------------------------------
// Stat — minimal, matches /impact/report-2025/ highlights style
// ---------------------------------------------------------------------------

type StatProps = {
  label: string
  value: number
  caption?: string
  format?: (n: number) => string
  series?: MetricSeries
  color?: string
  onExpand?: () => void
}

function Stat({
  label,
  value,
  caption,
  format = formatCount,
  series,
  color = 'var(--color-blue, #1982F4)',
  onExpand,
}: StatProps) {
  const animated = useCountUp(value)
  const hasSeries = !!series && series.values.length > 1 && !!onExpand

  const inner = (
    <>
      <div className="flex items-end justify-between gap-3">
        <div
          className={`text-2xl lg:text-3xl font-semibold text-black tabular-nums transition-colors ${
            hasSeries ? 'group-hover:text-blue' : ''
          }`}
        >
          {format(animated)}
        </div>
        {hasSeries && (
          <Sparkline values={series!.values} color={color} className="w-16 h-7 shrink-0" />
        )}
      </div>
      <div className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
        {label}
        {hasSeries && (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="w-3 h-3 text-gray-300 group-hover:text-blue transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" />
          </svg>
        )}
      </div>
      {caption && <div className="text-xs text-gray-400 mt-1">{caption}</div>}
    </>
  )

  if (hasSeries) {
    return (
      <button
        type="button"
        onClick={onExpand}
        aria-label={`Expand ${label} trend`}
        className="group block w-full text-left cursor-pointer outline-none"
      >
        {inner}
      </button>
    )
  }
  return <div>{inner}</div>
}

// ---------------------------------------------------------------------------
// Sparkline — tiny inline cumulative curve (no axes, no interactivity)
// ---------------------------------------------------------------------------

function sparkPaths(values: number[], vw: number, vh: number) {
  const n = values.length
  const maxY = Math.max(1, ...values)
  const x = (i: number) => (i / (n - 1)) * vw
  const y = (v: number) => vh - (v / maxY) * vh
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${vw},${vh} L0,${vh} Z`
  return { line, area }
}

function Sparkline({
  values,
  color,
  className = '',
}: {
  values: number[]
  color: string
  className?: string
}) {
  const VW = 100
  const VH = 32
  const { line, area } = sparkPaths(values, VW, VH)
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d={area} fill={color} opacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Metric modal — full interactive line graph for one metric
// ---------------------------------------------------------------------------

type MetricModalProps = {
  title: string
  caption?: string
  series: MetricSeries
  color: string
  format: (n: number) => string
  onClose: () => void
}

function MetricModal({ title, caption, series, color, format, onClose }: MetricModalProps) {
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const { days, values } = series
  const n = values.length
  const VW = 720
  const VH = 320
  const pad = { top: 16, right: 16, bottom: 28, left: 56 }
  const iw = VW - pad.left - pad.right
  const ih = VH - pad.top - pad.bottom
  const maxRaw = Math.max(1, ...values)
  const maxY = niceMax(maxRaw)
  const x = (i: number) => pad.left + (n <= 1 ? 0 : (i / (n - 1)) * iw)
  const y = (v: number) => pad.top + ih - (v / maxY) * ih
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${x(n - 1).toFixed(1)},${(pad.top + ih).toFixed(1)} L${x(0).toFixed(
    1,
  )},${(pad.top + ih).toFixed(1)} Z`

  // y gridlines
  const yTicks: number[] = []
  const tickStep = maxY / 4
  for (let v = 0; v <= maxY + 0.5; v += tickStep) yTicks.push(Math.round(v))

  // x labels: first, middle, last
  const idxs = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0]
  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const focus = hover != null ? { i: hover, v: values[hover], d: days[hover] } : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trend`}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <div className="text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-black tabular-nums">
                {format(values[n - 1] ?? 0)}
              </span>
              {days.length > 0 && (
                <span>
                  {' '}
                  · {fmtDate(days[0])} → {fmtDate(days[n - 1])}
                </span>
              )}
            </div>
            {caption && <div className="text-xs text-gray-400 mt-1">{caption}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ aspectRatio: `${VW} / ${VH}` }}
          onMouseLeave={() => setHover(null)}
        >
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={pad.left} x2={pad.left + iw} y1={y(v)} y2={y(v)} stroke="#EEEEF0" strokeWidth={1} />
              <text x={pad.left - 10} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#A0A0A6">
                {formatCount(v)}
              </text>
            </g>
          ))}

          <path d={area} fill={color} opacity={0.1} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {idxs.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={VH - 6}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              fontSize={11}
              fill="#A0A0A6"
            >
              {fmtDate(days[i])}
            </text>
          ))}

          {focus && (
            <g>
              <line x1={x(focus.i)} x2={x(focus.i)} y1={pad.top} y2={pad.top + ih} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
              <circle cx={x(focus.i)} cy={y(focus.v)} r={4} fill={color} />
            </g>
          )}

          {/* hover hit areas */}
          {n > 1 &&
            values.map((_, i) => (
              <rect
                key={i}
                x={x(i) - iw / (n - 1) / 2}
                y={pad.top}
                width={iw / (n - 1)}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            ))}
        </svg>

        {focus && (
          <div className="mt-3 text-sm text-gray-600 tabular-nums">
            <span className="font-medium text-black">{format(focus.v)}</span>{' '}
            <span className="text-gray-400">on {fmtDate(focus.d)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Round a max value up to a clean axis bound. */
function niceMax(v: number): number {
  if (v <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
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
          <Stat
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

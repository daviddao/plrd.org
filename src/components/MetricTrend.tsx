'use client'

import { useEffect, useState } from 'react'
import { type MetricSeries, niceMax } from '@/lib/trends'

// ---------------------------------------------------------------------------
// Shared metric helpers + trend UI (sparkline, clickable stat, modal).
// Used by both the Simocracy and GainForest live-dashboard sections.
// ---------------------------------------------------------------------------

export function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

/** Compact USD for headline stats so magnitudes line up across sections:
 *  $15K · $580K · $16.7M. */
export function formatUsd(n: number): string {
  if (n >= 1_000_000) {
    return `$${(n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`
  }
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString('en-US')}`
}

/** Animate a number from 0 → target with ease-out cubic. */
export function useCountUp(target: number, duration = 800): number {
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
// Sparkline — tiny inline cumulative curve (no axes, no interactivity)
// ---------------------------------------------------------------------------

function sparkPaths(values: number[], vw: number, vh: number, minBaseline = false) {
  const n = values.length
  // When `minBaseline`, scale from min→max instead of 0→max so a near-the-top
  // tail (e.g. the newest 1,000 of 400k+ observations) shows its slope rather
  // than flatlining against a giant 0-based axis.
  const lo = minBaseline ? Math.min(...values) : 0
  const hi = Math.max(lo + 1, ...values)
  const span = hi - lo || 1
  const x = (i: number) => (i / (n - 1)) * vw
  const y = (v: number) => vh - ((v - lo) / span) * vh
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${vw},${vh} L0,${vh} Z`
  return { line, area }
}

export function Sparkline({
  values,
  color,
  className = '',
  minBaseline = false,
}: {
  values: number[]
  color: string
  className?: string
  minBaseline?: boolean
}) {
  const VW = 100
  const VH = 32
  const { line, area } = sparkPaths(values, VW, VH, minBaseline)
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className={className} aria-hidden>
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
// TrendStat — big number + inline sparkline; clickable to expand a modal
// ---------------------------------------------------------------------------

type TrendStatProps = {
  label: string
  value: number
  caption?: string
  format?: (n: number) => string
  series?: MetricSeries
  color?: string
  onExpand?: () => void
  /** Scale the sparkline from min→max instead of 0→max (for near-the-top tails). */
  minBaseline?: boolean
}

export function TrendStat({
  label,
  value,
  caption,
  format = formatCount,
  series,
  color = 'var(--color-blue, #1982F4)',
  onExpand,
  minBaseline = false,
}: TrendStatProps) {
  const animated = useCountUp(value)
  const hasSeries = !!series && series.values.length > 1 && !!onExpand

  const inner = (
    <>
      <div className="flex items-end gap-4">
        <div
          className={`shrink-0 text-2xl lg:text-3xl font-semibold text-black tabular-nums transition-colors ${
            hasSeries ? 'group-hover:text-blue' : ''
          }`}
        >
          {format(animated)}
        </div>
        {hasSeries && (
          <Sparkline
            values={series!.values}
            color={color}
            minBaseline={minBaseline}
            className="flex-1 min-w-0 h-9"
          />
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
// MetricModal — full interactive line graph for one metric
// ---------------------------------------------------------------------------

type MetricModalProps = {
  title: string
  caption?: string
  series: MetricSeries
  color: string
  format?: (n: number) => string
  onClose: () => void
  /** Scale the y-axis from min→max instead of 0→max (for near-the-top tails). */
  minBaseline?: boolean
}

export function MetricModal({
  title,
  caption,
  series,
  color,
  format = formatCount,
  onClose,
  minBaseline = false,
}: MetricModalProps) {
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
  // With `minBaseline`, frame the chart between the series' own min and max so
  // a tail riding near a huge total still reads as a slope (matches the
  // gainforest-explorer band). Otherwise keep the classic 0-based axis.
  const minY = minBaseline ? Math.min(...values) : 0
  const maxY = minBaseline ? Math.max(minY + 1, maxRaw) : niceMax(maxRaw)
  const span = maxY - minY || 1
  const x = (i: number) => pad.left + (n <= 1 ? 0 : (i / (n - 1)) * iw)
  const y = (v: number) => pad.top + ih - ((v - minY) / span) * ih
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${x(n - 1).toFixed(1)},${(pad.top + ih).toFixed(1)} L${x(0).toFixed(
    1,
  )},${(pad.top + ih).toFixed(1)} Z`

  // y gridlines — 5 evenly spaced ticks across the [minY, maxY] domain.
  const yTicks: number[] = []
  const tickStep = span / 4
  for (let k = 0; k <= 4; k++) yTicks.push(Math.round(minY + tickStep * k))

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

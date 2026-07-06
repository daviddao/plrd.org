'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ROLE_META,
  PL_ROLE_ORDER,
  FIELD_COLOR,
  HAND_COLOR,
  LIVE_COLOR,
  FIELD_STAGES,
  FOCUS_AREAS,
  INFLECTION_POINTS,
  stageIndexForStatus,
  type FocusAreaKey,
  type InflectionPoint,
  type PLRole,
} from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import type { MarketSignal } from '@/lib/market-signals'

type Filter = FocusAreaKey

/** Live output metrics for a point, keyed by the point's title. Fetched server-side. */
export type LiveMetric = { value: string; label: string }
export type LiveOutputs = Record<string, LiveMetric[]>
/** Prediction-market crowd signal per point, keyed by title. Fetched server-side. */
export type MarketSignals = Record<string, MarketSignal>

const PLATFORM_LABEL: Record<'polymarket' | 'kalshi', string> = {
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
}

// Generic footnote for cards/points that surface a live signal.
const LIVE_SIGNAL_NOTE =
  'Live signals from a PL-supported mechanism. This may be limited to contribution evidence — not evidence of inflection point crossing.'

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

export default function ImpactDashboard({
  liveOutputs = {},
  marketSignals = {},
}: {
  liveOutputs?: LiveOutputs
  marketSignals?: MarketSignals
}) {
  const [filter, setFilter] = useState<FocusAreaKey>('digital-human-rights')
  const [active, setActive] = useState<InflectionPoint | null>(null)

  const visible = useMemo(
    () => INFLECTION_POINTS.filter((p) => p.area === filter),
    [filter],
  )

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      {/* Vertical tabs */}
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Filter by focus area"
        className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {FOCUS_AREAS.map((fa) => (
          <Tab
            key={fa.key}
            label={fa.label}
            count={INFLECTION_POINTS.filter((p) => p.area === fa.key).length}
            icon={FA_ICON[fa.key]}
            active={filter === fa.key}
            onClick={() => setFilter(fa.key)}
          />
        ))}
      </div>

      {/* Content */}
      <div>
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visible.map((p) => (
              <InflectionCard
                key={`${p.area}-${p.title}`}
                point={p}
                metrics={liveOutputs[p.title]}
                signal={marketSignals[p.title]}
                onOpen={() => setActive(p)}
              />
            ))}
          </div>
        ) : (
          <EmptyState filter={filter} />
        )}
      </div>

      {active && (
        <InflectionModal
          point={active}
          metrics={liveOutputs[active.title]}
          signal={marketSignals[active.title]}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function Tab({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  icon?: AreaIconType
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium transition-all lg:w-full ${
        active
          ? 'border-gray-200 bg-white text-black shadow-sm'
          : 'border-transparent text-gray-500 hover:bg-white/60 hover:text-black'
      }`}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center"
        style={{ color: active ? '#131316' : '#9ca3af' }}
      >
        {icon && <AreaIcon type={icon} className="block h-5 w-5" />}
      </span>
      <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{label}</span>
      <span className="text-xs tabular-nums text-gray-400">{count}</span>
    </button>
  )
}

/** Field-progress lifecycle meter — the “field” axis (teal). */
function FieldMeter({
  status,
  compact = false,
}: {
  status: InflectionPoint['status']
  compact?: boolean
}) {
  const reached = stageIndexForStatus(status)
  return (
    <div>
      <div className="flex gap-1">
        {FIELD_STAGES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i <= reached ? FIELD_COLOR : '#e5e7eb' }}
          />
        ))}
      </div>
      {!compact && (
        <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
          {FIELD_STAGES.map((s, i) => (
            <span key={s} className={i === reached ? 'font-medium text-gray-600' : ''}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** One pill per PL role, in canonical order. */
function RoleChips({ roles, eyebrow = true }: { roles: PLRole[]; eyebrow?: boolean }) {
  const ordered = PL_ROLE_ORDER.filter((r) => roles.includes(r))
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {eyebrow && (
        <span className="text-[10px] uppercase tracking-wide" style={{ color: HAND_COLOR }}>PL role</span>
      )}
      {ordered.map((r) => (
        <span key={r} className="group/role relative inline-flex">
          <span
            className="inline-flex cursor-help items-center rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{ color: HAND_COLOR, borderColor: `${HAND_COLOR}55`, backgroundColor: `${HAND_COLOR}12` }}
          >
            {ROLE_META[r].label}
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/role:opacity-100"
          >
            <span className="font-semibold">{ROLE_META[r].label}</span> — {ROLE_META[r].description}
          </span>
        </span>
      ))}
    </span>
  )
}

/** Compact crowd-odds read for the FIELD axis on a card (non-interactive). */
function CrowdSignalInline({ signal }: { signal: MarketSignal }) {
  if (signal.match === 'gap') {
    return (
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
        No market yet — unpriced bet
      </div>
    )
  }
  const pct = signal.prob != null ? Math.round(signal.prob * 100) : null
  return (
    <div className="mt-2.5 flex items-center gap-2 text-[11px]">
      <span className="text-gray-400">
        Crowd{signal.platform ? ` · ${PLATFORM_LABEL[signal.platform]}` : ''}
      </span>
      <span className="truncate text-gray-400">{signal.question}</span>
      <span className="ml-auto shrink-0 font-semibold tabular-nums" style={{ color: FIELD_COLOR }}>
        {pct != null ? `${pct}%` : 'live'}
      </span>
    </div>
  )
}

function InflectionCard({
  point,
  metrics,
  signal,
  onOpen,
}: {
  point: InflectionPoint
  metrics?: LiveMetric[]
  signal?: MarketSignal
  onOpen: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!
  const stageLabel = FIELD_STAGES[stageIndexForStatus(point.status)]

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Subtle detail affordance */}
      <span className="absolute right-4 top-4 inline-flex items-center gap-0.5 text-xs font-medium text-gray-300 transition-colors group-hover:text-blue">
        Detail
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>

      {/* Header: focus area (neutral — no per-area color) */}
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <span className="flex h-4 w-4 items-center justify-center text-gray-400">
          <AreaIcon type={FA_ICON[fa.key]} className="block h-3.5 w-3.5" />
        </span>
        {fa.label}
      </div>

      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
        {point.opportunitySpace}
      </div>
      <h3 className="mb-2 text-lg font-medium leading-snug text-black">{point.title}</h3>
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">{point.signal}</p>

      {/* THE FIELD — did it happen & matter (teal) */}
      <div className="border-t border-gray-100 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
            The field
          </span>
          <span className="text-[11px] text-gray-400">· did it happen & matter</span>
          <span className="ml-auto text-[11px] font-medium" style={{ color: FIELD_COLOR }}>{stageLabel}</span>
        </div>
        <FieldMeter status={point.status} />
        {signal && <CrowdSignalInline signal={signal} />}
      </div>

      {/* OUR HAND — did our work help (violet) */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
            Our hand
          </span>
          <span className="text-[11px] text-gray-400">· how is PL making a difference</span>
        </div>
        <RoleChips roles={point.roles} eyebrow={false} />
      </div>

      {/* LIVE SIGNAL — present only for points with live outputs */}
      {metrics && metrics.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
            </span>
            Live signal
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {metrics.map((m) => (
              <span key={m.label} className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-black">{m.value}</span>
                <span className="text-xs text-gray-500">{m.label}</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{LIVE_SIGNAL_NOTE}</p>
        </div>
      )}

    </button>
  )
}

/** Compact USD, e.g. $15k, $1.2M. */
function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

/** Crowd-forecast row for the modal's horizontal Live-signal band (with market link). */
function CrowdForecast({ signal, divider = false }: { signal: MarketSignal; divider?: boolean }) {
  const pct = signal.prob != null ? Math.round(signal.prob * 100) : null
  return (
    <div className={divider ? 'mt-3 border-t border-gray-100 pt-3' : ''}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Crowd forecast
        </span>
        {signal.platform && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {PLATFORM_LABEL[signal.platform]}
            {signal.viaFallback ? ' (fallback)' : ''}
          </span>
        )}
        {signal.volume != null && (
          <span className="text-[11px] tabular-nums text-gray-400" title="Total money traded through this market">
            {formatUSD(signal.volume)} at stake
          </span>
        )}
        <span className="ml-auto text-2xl font-semibold tabular-nums" style={{ color: FIELD_COLOR }}>
          {pct != null ? `${pct}%` : '—'}
        </span>
      </div>
      {signal.url && (
        <a
          href={signal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-gray-700 hover:underline"
        >
          {signal.question}
        </a>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
        {signal.note} Independent estimate on the field axis — not PL contribution, not a settled outcome.
      </p>
    </div>
  )
}

function InflectionModal({
  point,
  metrics,
  signal,
  onClose,
}: {
  point: InflectionPoint
  metrics?: LiveMetric[]
  signal?: MarketSignal
  onClose: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={point.title}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="flex h-5 w-5 items-center justify-center text-gray-400">
              <AreaIcon type={FA_ICON[fa.key]} className="block h-4 w-4" />
            </span>
            {fa.label}
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">{point.opportunitySpace}</span>
          </div>
          <h2 className="mb-5 text-2xl font-semibold leading-tight tracking-tight text-black">
            {point.title}
          </h2>

          {/* Field progress — full width */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
              Progress against Inflection Point
            </div>
            <FieldMeter status={point.status} />
          </div>

          {/* Two axes: our hand | the field */}
          <div className="grid gap-8 sm:grid-cols-2">
            {/* OUR HAND */}
            <div className="sm:border-r sm:border-gray-100 sm:pr-8">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>Our hand</div>
              <div className="mb-3 flex items-center gap-2">
                <QBadge letter="A" color={HAND_COLOR} />
                <span className="text-sm font-semibold text-black">How is PL making a difference?</span>
              </div>
              <div className="mb-4"><RoleChips roles={point.roles} eyebrow={false} /></div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Inputs</div>
                  <p className="text-sm leading-relaxed text-gray-600">{point.contribution.inputs}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Activities</div>
                  <p className="text-sm leading-relaxed text-gray-600">{point.contribution.activities}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Outputs</div>
                  <p className="text-sm leading-relaxed text-gray-600">{point.contribution.outputs}</p>
                </div>
              </div>
            </div>

            {/* THE FIELD */}
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>The field</div>
              <div className="mb-2 flex items-center gap-2">
                <QBadge letter="B" color={FIELD_COLOR} />
                <span className="text-sm font-semibold text-black">Did it happen?</span>
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Outcome — the inflection point</div>
              <p className="mb-5 text-sm leading-relaxed text-gray-600">{point.signal}</p>
              <div className="mb-2 flex items-center gap-2">
                <QBadge letter="C" color={FIELD_COLOR} />
                <span className="text-sm font-semibold text-black">Did it matter?</span>
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Impact — the cascade</div>
              <p className="text-sm leading-relaxed text-gray-600">{point.cascade}</p>
            </div>
          </div>

          {/* Full-width Live-signal band: PL-backed live outputs (Q3) + crowd forecast (field axis). */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            {(point.liveEvidence || (signal && signal.match !== 'gap')) && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
                  </span>
                  Live signal
                </div>

                {point.liveEvidence && (
                  <a
                    href={point.liveEvidence.href}
                    className="-m-1 block rounded-lg p-1 no-underline transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-black">
                      {point.liveEvidence.label}
                      <svg className="ml-auto h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {metrics && metrics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                        {metrics.map((m) => (
                          <span key={m.label} className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-black">{m.value}</span>
                            <span className="text-xs text-gray-500">{m.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                      {LIVE_SIGNAL_NOTE}
                    </p>
                  </a>
                )}

                {signal && signal.match !== 'gap' && (
                  <CrowdForecast signal={signal} divider={!!point.liveEvidence} />
                )}
              </div>
            )}

            {signal && signal.match === 'gap' && (
              <div className="mb-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Crowd forecast
                </div>
                <p className="text-sm leading-relaxed text-gray-500">{signal.note}</p>
              </div>
            )}

            <a
              href={`/insights/?area=${point.area}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
            >
              See the latest {fa.label} insights
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function QBadge({ letter, color }: { letter: string; color: string }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {letter}
    </span>
  )
}

function EmptyState({ filter }: { filter: Filter }) {
  const fa = FOCUS_AREAS.find((f) => f.key === filter)
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <p className="text-base font-medium text-black">
        Inflection points for {fa?.label ?? 'this focus area'} are being defined.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        This focus area is still finalizing its plan of attack. Its inflection points will appear
        here once they are set.
      </p>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ROLE_META,
  PL_ROLE_ORDER,
  FIELD_COLOR,
  FIELD_TRACK,
  HAND_COLOR,
  LIVE_COLOR,
  FIELD_STAGES,
  FOCUS_AREAS,
  INFLECTION_POINTS,
  TEAM_LINKS,
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

// Turn any team/venture name present in TEAM_LINKS into a link, wherever it
// appears in contribution copy. Names are matched longest-first so multi-word
// names (e.g. "Funding the Commons") win over any shorter substring.
const TEAM_LINK_PATTERN = new RegExp(
  '(' +
    Object.keys(TEAM_LINKS)
      .sort((a, b) => b.length - a.length)
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')',
  'g',
)

function Linkify({ text }: { text: string }) {
  const parts = text.split(TEAM_LINK_PATTERN)
  return (
    <>
      {parts.map((part, i) =>
        TEAM_LINKS[part] ? (
          <a
            key={i}
            href={TEAM_LINKS[part]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-black"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
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
        style={{ color: active ? 'var(--impact-field)' : '#9ca3af' }}
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
            style={{ backgroundColor: i <= reached ? FIELD_COLOR : FIELD_TRACK }}
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
            style={{
              color: HAND_COLOR,
              borderColor: 'color-mix(in srgb, var(--impact-hand) 34%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--impact-hand) 8%, transparent)',
            }}
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
  // Whether this point has any live signal worth opening the card for. The
  // preview only hints that something exists — the detail lives in the modal.
  const hasLiveSignal = !!(
    point.liveEvidence?.length ||
    (metrics && metrics.length) ||
    (signal && signal.match !== 'gap')
  )

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

      {/* LIVE SIGNAL — preview only hints that something is here; detail is in the modal */}
      {hasLiveSignal && (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
          </span>
          Live signal
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
          {/* THE FIELD — title, outcome, impact, then progress (grey card) */}
          <div className="rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
              The field
            </div>
            <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-black">
              {point.title}
            </h2>
            <div className="mb-6 space-y-5">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Outcome</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.signal}</p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Impact</div>
                <p className="text-sm leading-relaxed text-gray-600">{point.cascade}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
                Progress against Inflection Point
              </div>
              <FieldMeter status={point.status} />
            </div>
          </div>

          {/* OUR HAND — grey card: PL intervention pills (definition on hover) + real examples */}
          <div className="mt-4 rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
              Our hand
            </div>
            <div className="mb-4 text-sm font-semibold text-black">How PL is making a difference</div>
            <RoleChips roles={point.roles} eyebrow={false} />
            <div className="mt-5">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">In practice</div>
              <p className="text-sm leading-relaxed text-gray-600"><Linkify text={point.contribution.activities} /></p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500"><Linkify text={point.contribution.outputs} /></p>
            </div>
          </div>

          {/* LIVE SIGNAL — grey card: title, PL-backed live outputs (Q3), crowd forecast, latest insights */}
          <div className="mt-4 rounded-xl bg-gray-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: `${LIVE_COLOR}99` }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIVE_COLOR }} />
              </span>
              Live signal
            </div>
            {(point.liveEvidence?.length || (metrics && metrics.length) || (signal && signal.match !== 'gap')) && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                {point.liveEvidence?.map((ev, i) => {
                  const external = /^https?:\/\//.test(ev.href)
                  return (
                    <a
                      key={ev.href}
                      href={ev.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={`-m-1 block rounded-lg p-1 no-underline transition-colors hover:bg-gray-50 ${i > 0 ? 'mt-3 border-t border-gray-100 pt-3' : ''}`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-black">
                        {ev.label}
                        <svg className="ml-auto h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {i === 0 && metrics && metrics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                          {metrics.map((m) => (
                            <span key={m.label} className="flex items-baseline gap-1.5">
                              <span className="text-lg font-semibold text-black">{m.value}</span>
                              <span className="text-xs text-gray-500">{m.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-gray-500">{ev.note}</p>
                    </a>
                  )
                })}

                {!point.liveEvidence?.length && metrics && metrics.length > 0 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {metrics.map((m) => (
                      <span key={m.label} className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-black">{m.value}</span>
                        <span className="text-xs text-gray-500">{m.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {signal && signal.match !== 'gap' && (
                  <CrowdForecast signal={signal} divider={!!point.liveEvidence?.length} />
                )}
              </div>
            )}

            {signal && signal.match === 'gap' && (
              <div className="mb-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
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

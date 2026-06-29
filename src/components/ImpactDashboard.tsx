'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CONTRIBUTION_META,
  FIELD_STAGES,
  FOCUS_AREAS,
  INFLECTION_POINTS,
  STATUS_META,
  stageIndexForStatus,
  type FocusAreaKey,
  type InflectionPoint,
} from '@/lib/inflection-points'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'

type Filter = FocusAreaKey

/** Live output metrics for a point, keyed by the point's title. Fetched server-side. */
export type LiveMetric = { value: string; label: string }
export type LiveOutputs = Record<string, LiveMetric[]>

const FA_ICON: Record<FocusAreaKey, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

export default function ImpactDashboard({ liveOutputs = {} }: { liveOutputs?: LiveOutputs }) {
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
            accent={fa.accent}
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
  accent,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  icon?: AreaIconType
  accent?: string
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
        style={{ color: active ? accent ?? '#131316' : '#9ca3af' }}
      >
        {icon && <AreaIcon type={icon} className="block h-5 w-5" />}
      </span>
      <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{label}</span>
      <span className="text-xs tabular-nums text-gray-400">{count}</span>
    </button>
  )
}

/** Field-progress lifecycle meter (Q1 -> Q2). Colored in the focus-area accent. */
function FieldMeter({
  status,
  accent,
  compact = false,
}: {
  status: InflectionPoint['status']
  accent: string
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
            style={{ backgroundColor: i <= reached ? accent : '#e5e7eb' }}
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

function ContributionChip({ level }: { level: InflectionPoint['contributionLevel'] }) {
  const meta = CONTRIBUTION_META[level]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-dark-blue/20 bg-dark-blue/[0.06] px-2.5 py-1 text-xs font-medium text-dark-blue"
      title={meta.description}
    >
      <span className="text-[10px] uppercase tracking-wide text-dark-blue/60">PL role</span>
      {meta.label}
    </span>
  )
}

function InflectionCard({
  point,
  onOpen,
}: {
  point: InflectionPoint
  onOpen: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group flex flex-col rounded-xl border border-gray-200 border-l-[3px] bg-white p-6 text-left transition-all hover:border-blue/40 hover:shadow-md"
      style={{ borderLeftColor: fa.accent }}
    >
      {/* Header: area badge */}
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <span className="flex h-4 w-4 items-center justify-center" style={{ color: fa.accent }}>
          <AreaIcon type={FA_ICON[fa.key]} className="block h-3.5 w-3.5" />
        </span>
        {fa.label}
      </div>

      <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
        {point.opportunitySpace}
      </div>
      <h3 className="mb-4 text-lg font-medium leading-snug text-black">{point.title}</h3>

      {/* Field-progress axis */}
      <FieldMeter status={point.status} accent={fa.accent} />

      {/* Inflection point teaser */}
      <div className="mt-4">
        <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Inflection point
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">{point.signal}</p>
      </div>

      {/* Footer: contribution axis + open hint */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <ContributionChip level={point.contributionLevel} />
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors group-hover:text-blue">
          Detail
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  )
}

function InflectionModal({
  point,
  metrics,
  onClose,
}: {
  point: InflectionPoint
  metrics?: LiveMetric[]
  onClose: () => void
}) {
  const fa = FOCUS_AREAS.find((f) => f.key === point.area)!
  const status = STATUS_META[point.status]
  const role = CONTRIBUTION_META[point.contributionLevel]

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
        className="relative my-4 w-full max-w-2xl rounded-2xl border-t-4 bg-white shadow-2xl"
        style={{ borderTopColor: fa.accent }}
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
            <span className="flex h-5 w-5 items-center justify-center" style={{ color: fa.accent }}>
              <AreaIcon type={FA_ICON[fa.key]} className="block h-4 w-4" />
            </span>
            {fa.label}
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">{point.opportunitySpace}</span>
          </div>
          <h2 className="mb-5 text-2xl font-semibold leading-tight tracking-tight text-black">
            {point.title}
          </h2>

          {/* Field axis */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Field progress
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600"
                title={status.description}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                {status.label}
              </span>
            </div>
            <FieldMeter status={point.status} accent={fa.accent} />
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              The field axis (Q1 → Q2) is tracked independently of PL&rsquo;s contribution. It can
              advance with little or no PL involvement.
            </p>
          </div>

          {/* Three questions — each tagged with the logic-model stage it maps to */}
          <Section q="Q1" label="Did it happen? — the signal" accent={fa.accent}>
            <LogicRow label="Impact">{point.signal}</LogicRow>
          </Section>
          <Section q="Q2" label="Did it matter? — the cascade" accent={fa.accent}>
            <LogicRow label="Outcome">{point.cascade}</LogicRow>
          </Section>
          <Section q="Q3" label="Did our work make it happen? — PL contribution" accent={fa.accent}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <ContributionChip level={point.contributionLevel} />
              <span className="text-xs text-gray-500">{role.description}</span>
            </div>
            <div className="space-y-2.5">
              <LogicRow label="Inputs">{point.contribution.inputs}</LogicRow>
              <LogicRow label="Activities">{point.contribution.activities}</LogicRow>
              <LogicRow label="Outputs">{point.contribution.outputs}</LogicRow>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Inputs → activities → outputs are PL&rsquo;s planned work. The outcomes and impact they
              aim at are tracked on the field axis above (Q2, then Q1).
            </p>
          </Section>

          {/* Live evidence (Q3 only — never a Q1 reading) */}
          {point.liveEvidence && (
            <a
              href={point.liveEvidence.href}
              className="mt-5 block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-blue/40 no-underline"
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Live outputs
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-black">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                </span>
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
                {point.liveEvidence.note}
              </p>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function LogicRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-20 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="flex-1 text-sm leading-relaxed text-gray-600">{children}</span>
    </div>
  )
}

function Section({
  q,
  label,
  accent,
  children,
}: {
  q: string
  label: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-gray-100 py-4 first:border-t-0">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {q}
        </span>
        <span className="text-sm font-semibold text-black">{label}</span>
      </div>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
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
        This focus area is still finalizing its plan of attack. Its pre-registered bets will appear
        here once they are set.
      </p>
    </div>
  )
}

import Link from 'next/link'

/**
 * Compact, headline-style preview of the FA2 Live Dashboard. Renders a curated
 * handful of real ecosystem numbers (Simocracy governance, Glow solar,
 * GainForest hypercerts) — each with a small activity sparkline — and a
 * prominent link through to the full dashboard.
 *
 * Presentational only — the parent server component fetches the stats and
 * passes plain numbers + trend series in. Any source that's unreachable
 * arrives as 0 and is filtered out; if fewer than two live numbers survive,
 * the band hides itself so the page never shows a broken row of zeroes.
 */
type Metric = { value: number; series: number[] }

type FA2LiveStatsBandProps = {
  href: string
  sim: { totalSims: Metric; treasuryUsd: Metric; totalGatherings: Metric }
  gainforest: { bumicerts: Metric; certifiedOrgs: Metric }
  glow: { powerOutput: Metric; activeFarms: Metric }
}

function compact(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

/** Tiny inline activity chart built straight from a trend series. */
function Sparkline({ values, className = '' }: { values: number[]; className?: string }) {
  const pts = values.filter((v) => Number.isFinite(v))
  if (pts.length < 2) return null
  const W = 64
  const H = 28
  const P = 3
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const x = (i: number) => (i / (pts.length - 1)) * W
  const y = (v: number) => H - P - ((v - min) / span) * (H - 2 * P)
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${W.toFixed(1)},${H} L0,${H} Z`
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" opacity={0.12} />
      <path
        d={line}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function FA2LiveStatsBand({ href, sim, gainforest, glow }: FA2LiveStatsBandProps) {
  const candidates = [
    { m: sim.totalSims, display: compact(sim.totalSims.value), label: 'Sims minted', source: 'Simocracy', accent: 'text-blue/55' },
    { m: glow.powerOutput, display: `${compact(glow.powerOutput.value)} kWh`, label: 'Solar this week', source: 'Glow', accent: 'text-teal/70' },
    { m: sim.treasuryUsd, display: `$${compact(sim.treasuryUsd.value)}`, label: 'Treasury allocated', source: 'Simocracy', accent: 'text-blue/55' },
    { m: gainforest.bumicerts, display: compact(gainforest.bumicerts.value), label: 'Hypercerts issued', source: 'GainForest', accent: 'text-[#2f9e57]/70' },
    { m: gainforest.certifiedOrgs, display: compact(gainforest.certifiedOrgs.value), label: 'Certified orgs', source: 'GainForest', accent: 'text-[#2f9e57]/70' },
    { m: sim.totalGatherings, display: compact(sim.totalGatherings.value), label: 'Gatherings convened', source: 'Simocracy', accent: 'text-blue/55' },
    { m: glow.activeFarms, display: compact(glow.activeFarms.value), label: 'Solar farms', source: 'Glow', accent: 'text-teal/70' },
  ]
  const items = candidates.filter((c) => Number.isFinite(c.m.value) && c.m.value > 0).slice(0, 4)
  if (items.length < 2) return null

  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-100 via-white to-white p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink" />
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500">Live ecosystem signal</span>
          </div>
          <Link
            href={href}
            className="group inline-flex items-center gap-2 self-start rounded-full bg-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue/90 no-underline"
          >
            Open live dashboard
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {items.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[26px] font-semibold leading-none tracking-tight text-black tabular-nums lg:text-[30px]">
                  {s.display}
                </span>
                <Sparkline values={s.m.series} className={`h-7 w-16 shrink-0 ${s.accent}`} />
              </div>
              <div className="mt-1.5 text-sm leading-tight text-gray-600">{s.label}</div>
              <div className="text-xs text-gray-400">{s.source}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'

/**
 * Compact, headline-style preview of the FA2 Live Dashboard. Renders a curated
 * handful of real ecosystem numbers (Simocracy governance, GainForest
 * biodiversity, Glow solar) and a prominent link through to the full dashboard.
 *
 * Presentational only — the parent server component fetches the stats and
 * passes plain numbers in. Any source that's unreachable arrives as 0 and is
 * filtered out; if fewer than two live numbers survive, the band hides itself
 * so the page never shows a broken row of zeroes.
 */
type FA2LiveStatsBandProps = {
  href: string
  sim: { totalSims: number; treasuryUsd: number; totalGatherings: number; totalSProcesses: number }
  gainforest: { observations: number; certifiedOrgs: number }
  glow: { powerOutput: number; activeFarms: number }
}

function compact(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export default function FA2LiveStatsBand({ href, sim, gainforest, glow }: FA2LiveStatsBandProps) {
  const candidates = [
    { value: sim.totalSims, display: compact(sim.totalSims), label: 'Sims minted', source: 'Simocracy' },
    { value: gainforest.observations, display: compact(gainforest.observations), label: 'Biodiversity records', source: 'GainForest' },
    { value: glow.powerOutput, display: `${compact(glow.powerOutput)} kWh`, label: 'Solar this week', source: 'Glow' },
    { value: sim.treasuryUsd, display: `$${compact(sim.treasuryUsd)}`, label: 'Treasury allocated', source: 'Simocracy' },
    { value: sim.totalGatherings, display: compact(sim.totalGatherings), label: 'Gatherings convened', source: 'Simocracy' },
    { value: gainforest.certifiedOrgs, display: compact(gainforest.certifiedOrgs), label: 'Certified orgs', source: 'GainForest' },
    { value: glow.activeFarms, display: compact(glow.activeFarms), label: 'Solar farms', source: 'Glow' },
  ]
  const items = candidates.filter((c) => Number.isFinite(c.value) && c.value > 0).slice(0, 4)
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
              <div className="text-[26px] font-semibold leading-none tracking-tight text-black tabular-nums lg:text-[30px]">
                {s.display}
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

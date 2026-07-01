import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ImpactDashboard, { type LiveMetric, type LiveOutputs } from '@/components/ImpactDashboard'
import MeasuringQuestions from '@/components/MeasuringQuestions'
import { fetchSimocracyStats } from '@/lib/simocracy'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchGlowStats } from '@/lib/glow'
import { LOGIC_MODEL, ROLE_META, PL_ROLE_ORDER, FIELD_COLOR, HAND_COLOR } from '@/lib/inflection-points'

// Pull live output metrics for the Economies & Governance inflection points from
// the same sources as the FA2 live dashboard. These are Q3 OUTPUTS (the work
// PL-backed teams have produced) — never Q2 progress toward a threshold.
export const revalidate = 60

async function fetchLiveOutputs(): Promise<LiveOutputs> {
  const compact = (n: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  const out: LiveOutputs = {}

  const [sim, gf, glow] = await Promise.allSettled([
    fetchSimocracyStats(),
    fetchGainforestStats(),
    fetchGlowStats(),
  ])

  // A binding decision at scale — Simocracy (a PL-supported deliberation mechanism).
  if (sim.status === 'fulfilled' && !sim.value.degraded) {
    const t = sim.value.totals
    const metrics: LiveMetric[] = [
      { n: t.uniqueHumans, label: 'participants' },
      { n: t.totalSims, label: 'simulations' },
      { n: t.totalGatherings, label: 'gatherings' },
    ]
      .filter((m) => m.n > 0)
      .map((m) => ({ value: compact(m.n), label: m.label }))
    if (metrics.length) out['A binding decision at scale'] = metrics
  }

  // Capital that pays on verified outcomes — GainForest + Glow (PL-backed MRV teams).
  const verified: LiveMetric[] = []
  if (gf.status === 'fulfilled' && !gf.value.degraded) {
    const g = gf.value
    if (g.observations > 0) verified.push({ value: compact(g.observations), label: 'species observations' })
    if (g.certifiedOrgs > 0) verified.push({ value: compact(g.certifiedOrgs), label: 'certified orgs' })
  }
  if (glow.status === 'fulfilled' && !glow.value.degraded) {
    const gl = glow.value
    if (gl.activeFarms > 0) verified.push({ value: compact(gl.activeFarms), label: 'active solar farms' })
    if (gl.carbon > 0) verified.push({ value: compact(gl.carbon), label: 'tCO₂ / wk' })
  }
  if (verified.length) out['Capital that pays on verified outcomes'] = verified

  return out
}

export const metadata: Metadata = {
  title: 'Impact',
  description:
    'How we measure whether PL R&D’s work matters: the inflection points we have pre-registered across every focus area, and how we will know if they happen.',
}

export default async function ImpactPage() {
  const liveOutputs = await fetchLiveOutputs()
  return (
    <div>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: 'Impact' }]} />
        <div className="pt-8 pb-10">
          <h1 className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-2xl">
            Our impact
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Across our four focus areas we have named a small set of{' '}
            <strong className="font-semibold text-black">inflection points</strong> — specific,
            observable, falsifiable shifts we believe would be catalytic, and that have not yet
            happened.
          </p>
        </div>
      </div>

      {/* Inflection points — grey full-bleed section to set it apart from the rest of the site */}
      <section className="border-y border-gray-200 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">
            Inflection points we are tracking
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-8">
            Select a focus area. Each card shows the defined threshold (did it happen), the cascade we
            expect if it matters, and the PL contribution we would trace.
          </p>
          <ImpactDashboard liveOutputs={liveOutputs} />
        </div>
      </section>

      {/* Measuring impact */}
      <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
        <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">Measuring impact</h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-7">
          Every inflection point runs along one chain — from the work we plan to the change in the
          world it aims at. We hold two axes apart and never collapse them into a single score:{' '}
          <strong className="font-semibold" style={{ color: HAND_COLOR }}>our hand</strong> (the work
          we control) and{' '}
          <strong className="font-semibold" style={{ color: FIELD_COLOR }}>the field</strong> (the
          change that follows, with or without us).
        </p>

        {/* Logic-model chain — color-coded by axis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
          {LOGIC_MODEL.map((stage, i) => {
            const color = i >= 3 ? FIELD_COLOR : HAND_COLOR
            return (
              <div key={stage.key} className="bg-white px-5 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
                    {stage.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-snug">{stage.body}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium uppercase tracking-wide text-gray-400">
          <span>← Our planned work</span>
          <span>The change in the world →</span>
        </div>

        {/* The three questions — always visible */}
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mt-10 mb-6">
          For frontier research, the hard part is the right edge of that chain. So for every
          inflection point we ask three questions — different jobs that should not be collapsed into
          one metric.
        </p>
        <MeasuringQuestions />
      </div>

      {/* The toolkit — deep dive on the "our hand" roles */}
      <section className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">
            Six roles, matched to the bottleneck each one releases
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-8">
            Every card tags the roles PL played — this is the legend those tags point to, and it is
            our account of how we create value: match the instrument to the bottleneck. A bet can be
            reached with little or no PL involvement, which is still a win for the field, and we
            record our role honestly.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PL_ROLE_ORDER.map((r) => (
              <div key={r} className="rounded-xl border border-gray-200 bg-white p-5">
                <span
                  className="mb-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{ color: HAND_COLOR, borderColor: `${HAND_COLOR}55`, backgroundColor: `${HAND_COLOR}12` }}
                >
                  {ROLE_META[r].label}
                </span>
                <p className="text-sm leading-relaxed text-gray-600">{ROLE_META[r].description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

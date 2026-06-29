import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ImpactDashboard, { type LiveMetric, type LiveOutputs } from '@/components/ImpactDashboard'
import MeasuringQuestions from '@/components/MeasuringQuestions'
import { fetchSimocracyStats } from '@/lib/simocracy'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchGlowStats } from '@/lib/glow'
import { LOGIC_MODEL } from '@/lib/inflection-points'

// Pull live output metrics for the Economies & Governance inflection points from
// the same sources as the FA2 live dashboard. These are Q3 OUTPUTS (the work
// PL-backed teams have produced) — never Q1 progress toward a threshold.
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
          Impact is the last link in a chain that runs from the work we plan to the results we
          intend. Inputs and activities are our planned work; outcomes and impact are the change in
          the world that follows. We only count something as impact when it is a durable shift in the
          system — not just activity or output.
        </p>

        <p className="text-sm text-gray-500 leading-relaxed max-w-3xl mb-6">
          Each inflection point instantiates this chain. On its card, the Q3 detail tracks our
          inputs, activities, and outputs; the field meter tracks the outcomes and impact they aim
          at.
        </p>

        {/* Logic-model chain — labels styled like the detail cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
          {LOGIC_MODEL.map((stage, i) => (
            <div key={stage.key} className="bg-white px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-400">
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {stage.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-snug">{stage.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium uppercase tracking-wide text-gray-400">
          <span>← Our planned work</span>
          <span>Our intended results →</span>
        </div>

        {/* The three questions — pick one to read its detail */}
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mt-10 mb-6">
          For frontier research, the hard part is the right edge of that chain. So for every
          inflection point we ask three questions — different jobs that should not be collapsed into
          one metric. Select one to read how we measure it.
        </p>
        <MeasuringQuestions />
      </div>
    </div>
  )
}

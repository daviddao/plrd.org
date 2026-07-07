import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ImpactDashboard, { type LiveMetric, type LiveOutputs } from '@/components/ImpactDashboard'
import MeasuringQuestions from '@/components/MeasuringQuestions'
import { fetchSimocracyStats } from '@/lib/simocracy'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchGlowStats } from '@/lib/glow'
import { resolveAllSignals } from '@/lib/market-signals'
import { FIELD_COLOR, HAND_COLOR, HOW_TO_READ } from '@/lib/inflection-points'

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
  const [liveOutputs, marketSignals] = await Promise.all([
    fetchLiveOutputs(),
    resolveAllSignals(),
  ])
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
          <a
            href="#methodology"
            className="mt-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-[15px]"
          >
            Our methodology
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
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
          <ImpactDashboard liveOutputs={liveOutputs} marketSignals={marketSignals} />
        </div>
      </section>

      {/* Our methodology */}
      <div id="methodology" className="max-w-6xl mx-auto px-6 py-14 lg:py-16 scroll-mt-24">
        <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-2">Our methodology</h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl mb-8">
          For every inflection point we ask three questions — different jobs that should not be
          collapsed into a single score. We hold two axes apart:{' '}
          <strong className="font-semibold" style={{ color: HAND_COLOR }}>our hand</strong> (the work
          we control) and{' '}
          <strong className="font-semibold" style={{ color: FIELD_COLOR }}>the field</strong> (the
          change that follows, with or without us).
        </p>
        <figure className="mb-10 border-l-2 border-gray-900 pl-5 sm:pl-6">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">How to read this</div>
          <blockquote className="text-lg lg:text-xl font-medium leading-relaxed tracking-tight text-black max-w-3xl">
            {HOW_TO_READ}
          </blockquote>
        </figure>
        <MeasuringQuestions />
      </div>
    </div>
  )
}

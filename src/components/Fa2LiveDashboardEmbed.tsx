import type { ReactNode } from 'react'
import GainforestImpact from '@/components/GainforestImpact'
import GlowImpact from '@/components/GlowImpact'
import FtcImpact from '@/components/FtcImpact'
import SimocracyDashboard from '@/components/SimocracyDashboard'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchMaEarthStats } from '@/lib/maearth'
import { fetchGlowStats } from '@/lib/glow'
import { fetchFtcStats } from '@/lib/ftc'
import { fetchSimocracyStats } from '@/lib/simocracy'

// Compact number + USD formatting for the collapsed teaser lines.
function n(v: number | undefined): string {
  if (!v || !Number.isFinite(v)) return '0'
  return Math.round(v).toLocaleString('en-US')
}
function usd(v: number | undefined): string {
  if (!v || !Number.isFinite(v)) return '$0'
  const a = Math.abs(v)
  if (a >= 1e6) return '$' + (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (a >= 1e3) return '$' + Math.round(v / 1e3) + 'K'
  return '$' + Math.round(v)
}

// One collapsible section — closed by default, teaser shown when collapsed.
function Section({
  title,
  teaser,
  children,
}: {
  title: string
  teaser: string
  children: ReactNode
}) {
  return (
    <details className="fa2-dashboard">
      <summary>
        <svg
          className="fa2-chev"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          {title} <span className="fa2-sub">{teaser}</span>
        </span>
        <span className="fa2-cta">Show</span>
      </summary>
      <div className="fa2-body">{children}</div>
    </details>
  )
}

// Live focus-area impact dashboard, rendered inline inside blog content as a
// set of themed collapsibles (each closed by default to save space). Same data
// + components as /areas/economies-governance/impact/live-dashboard, minus the
// page chrome. Server component: fetches on the server, refreshes via the host
// page's ISR window.
export default async function Fa2LiveDashboardEmbed() {
  const [gainforest, maearth, glow, ftc, simocracy] = await Promise.all([
    fetchGainforestStats(),
    fetchMaEarthStats(),
    fetchGlowStats(),
    fetchFtcStats(),
    fetchSimocracyStats(),
  ])

  const t = simocracy.totals
  const f = ftc.totals

  return (
    <div className="not-prose fa2-dashboard-group">
      <Section
        title="Environmental hypercerts"
        teaser={`${n(gainforest.certifiedOrgs)} orgs · ${n(gainforest.bumicerts)} hypercerts · ${usd(maearth.donations)} raised`}
      >
        <GainforestImpact stats={gainforest} maearth={maearth} section="hypercerts" />
      </Section>

      <Section
        title="Biodiversity data"
        teaser={`${n(gainforest.observations)} species observations`}
      >
        <GainforestImpact stats={gainforest} maearth={maearth} section="biodiversity" />
      </Section>

      <Section
        title="Solar energy"
        teaser={`${n(glow.activeFarms)} active farms · ${n(glow.powerOutput)} kWh · week ${n(glow.week)}`}
      >
        <GlowImpact stats={glow} />
      </Section>

      <Section
        title="Public goods funding"
        teaser={`${usd(f.pgfDistributed)} to builders · ${n(f.hackathonProjects)} projects shipped`}
      >
        <FtcImpact stats={ftc} />
      </Section>

      <Section
        title="Governance"
        teaser={`${n(t.uniqueHumans)} humans · ${n(t.totalProposals)} proposals · ${usd(t.treasuryUsd)} treasury`}
      >
        <SimocracyDashboard
          totals={simocracy.totals}
          trends={simocracy.trends}
          fetchedAt={simocracy.fetchedAt}
          degraded={simocracy.degraded}
        />
      </Section>

      <p className="fa2-dashboard-note">
        Live data from the focus area&rsquo;s network partners.{' '}
        <a
          href="/areas/economies-governance/impact/live-dashboard/"
          className="text-blue hover:underline"
        >
          Open the full dashboard →
        </a>
      </p>
    </div>
  )
}

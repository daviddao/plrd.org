import GainforestImpact from '@/components/GainforestImpact'
import GlowImpact from '@/components/GlowImpact'
import FtcImpact from '@/components/FtcImpact'
import SimocracyDashboard from '@/components/SimocracyDashboard'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchMaEarthStats } from '@/lib/maearth'
import { fetchGlowStats } from '@/lib/glow'
import { fetchFtcStats } from '@/lib/ftc'
import { fetchSimocracyStats } from '@/lib/simocracy'

// Live focus-area impact dashboard, rendered inline inside blog content.
// Same data + components as /areas/economies-governance/impact/live-dashboard,
// minus the page chrome, so it drops cleanly into the "Building the Field"
// section. Server component: fetches on the server, refreshes via the host
// page's ISR window.
export default async function Fa2LiveDashboardEmbed() {
  const [gainforest, maearth, glow, ftc, simocracy] = await Promise.all([
    fetchGainforestStats(),
    fetchMaEarthStats(),
    fetchGlowStats(),
    fetchFtcStats(),
    fetchSimocracyStats(),
  ])

  return (
    <div className="not-prose my-8">
      <GainforestImpact stats={gainforest} maearth={maearth} />
      <GlowImpact stats={glow} />
      <FtcImpact stats={ftc} />
      <SimocracyDashboard
        totals={simocracy.totals}
        trends={simocracy.trends}
        fetchedAt={simocracy.fetchedAt}
        degraded={simocracy.degraded}
      />
      <p className="mt-4 text-sm text-gray-500">
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

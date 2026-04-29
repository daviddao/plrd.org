import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import SimocracyDashboard from '@/components/SimocracyDashboard'
import {
  fetchSimocracyStats,
  resolveBlueskyProfiles,
} from '@/lib/simocracy'

export const metadata: Metadata = {
  title: 'Live Dashboard',
  description:
    'Real-time metrics tracking ecosystem activity across the Simocracy governance simulation.',
}

// 60-second ISR window so visitors see fresh-ish data without hammering the
// indexer. The underlying Simocracy fetches use revalidate: 60 too.
export const revalidate = 60

export default async function LiveDashboardPage() {
  const stats = await fetchSimocracyStats()

  // Server-side resolve Bluesky handles for the leaderboard / activity feed.
  const dids = new Set<string>()
  for (const u of stats.topUsers) dids.add(u.did)
  for (const e of stats.recentEvents) dids.add(e.actorDid)
  const profiles = await resolveBlueskyProfiles([...dids])

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Focus Areas', href: '/areas/' },
          { label: 'Economies & Governance', href: '/areas/economies-governance/' },
          { label: 'Impact', href: '/areas/economies-governance/impact/' },
          { label: 'Live Dashboard' },
        ]}
      />

      {/* Header */}
      <div className="pt-8 pb-12 mb-12">
        <h1 className="text-2xl lg:text-[36px] font-semibold mb-3">Live Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Live metrics from{' '}
          <a
            href="https://simocracy.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline"
          >
            Simocracy
          </a>
          , a governance simulation tracking treasuries governed, sims minted, and
          deliberations completed across the ecosystem.
        </p>
      </div>

      <SimocracyDashboard
        totals={stats.totals}
        pulse14d={stats.pulse14d}
        topSims={stats.topSims}
        topUsers={stats.topUsers}
        recentEvents={stats.recentEvents}
        profiles={profiles}
        fetchedAt={stats.fetchedAt}
        degraded={stats.degraded}
      />
    </div>
  )
}

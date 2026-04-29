import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import SimocracyDashboard from '@/components/SimocracyDashboard'
import { fetchSimocracyStats } from '@/lib/simocracy'

export const metadata: Metadata = {
  title: 'Live Dashboard',
  description:
    'Real-time metrics tracking ecosystem activity across the Simocracy governance simulation.',
}

// 60s ISR; underlying GraphQL fetches use the same window.
export const revalidate = 60

export default async function LiveDashboardPage() {
  const stats = await fetchSimocracyStats()

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

      <h1 className="mt-8 text-2xl lg:text-[36px] font-semibold mb-3">
        Live Dashboard
      </h1>
      <p className="text-lg text-gray-600 mb-12 max-w-2xl">
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

      <SimocracyDashboard
        totals={stats.totals}
        pulse14d={stats.pulse14d}
        fetchedAt={stats.fetchedAt}
        degraded={stats.degraded}
      />
    </div>
  )
}

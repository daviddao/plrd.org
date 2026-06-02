import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import SimocracyDashboard from '@/components/SimocracyDashboard'
import GainforestImpact from '@/components/GainforestImpact'
import { fetchSimocracyStats } from '@/lib/simocracy'
import { fetchGainforestStats } from '@/lib/gainforest'

export const metadata: Metadata = {
  title: 'Live Dashboard',
  description:
    'Real-time metrics tracking ecosystem activity across the Simocracy governance simulation.',
}

// 60s ISR; underlying GraphQL fetches use the same window.
export const revalidate = 60

export default async function LiveDashboardPage() {
  const [stats, gainforest] = await Promise.all([
    fetchSimocracyStats(),
    fetchGainforestStats(),
  ])

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
      <p className="text-lg text-gray-600 mb-3 max-w-2xl">
        Real-time metrics across the focus area: environmental hypercerts, the{' '}
        <a
          href="https://simocracy.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          Simocracy
        </a>{' '}
        governance simulation, and broad listening for large-scale collective
        deliberation.
      </p>
      <p className="text-sm text-gray-400 mb-12 max-w-2xl">
        In collaboration with associated network partners{' '}
        <a
          href="https://gainforest.earth"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue hover:underline"
        >
          GainForest
        </a>{' '}
        and{' '}
        <a
          href="https://maearth.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue hover:underline"
        >
          Ma Earth
        </a>
        .
      </p>

      <GainforestImpact stats={gainforest} />

      <SimocracyDashboard
        totals={stats.totals}
        trends={stats.trends}
        fetchedAt={stats.fetchedAt}
        degraded={stats.degraded}
      />
    </div>
  )
}

import { NextResponse } from 'next/server'
import { fetchSimocracyStats } from '@/lib/simocracy'
import { fetchGlowStats } from '@/lib/glow'
import { fetchGainforestStats } from '@/lib/gainforest'
import { fetchMaEarthStats } from '@/lib/maearth'
import { fetchFtcStats } from '@/lib/ftc'

export const dynamic = 'force-dynamic'

/**
 * GET /api/fa2-stats — the FA2 (Economies & Governance) live impact metrics
 * as one compact, agent-friendly JSON document.
 *
 * This is the same data the FA2 live dashboard
 * (/areas/economies-governance/impact/live-dashboard/) renders, minus the
 * heavyweight trend series and event feeds: just the headline totals from
 * each ecosystem source (Simocracy, Glow, GainForest, Ma Earth, Funding the
 * Commons),
 * with per-source `degraded` flags and fetch timestamps. Intended for AI
 * agents (e.g. the PL Agent Village) and anyone who wants the numbers
 * without scraping the page.
 */
export async function GET() {
  const [sim, glow, gainforest, maEarth, ftc] = await Promise.all([
    fetchSimocracyStats(),
    fetchGlowStats(),
    fetchGainforestStats(),
    fetchMaEarthStats(),
    fetchFtcStats(),
  ])

  return NextResponse.json(
    {
      focusArea: 'FA2 — Economies & Governance',
      dashboard: 'https://www.plrd.org/areas/economies-governance/impact/live-dashboard/',
      simocracy: {
        source: 'https://www.simocracy.org',
        ...sim.totals,
        fetchedAt: sim.fetchedAt,
        degraded: sim.degraded,
      },
      glow: {
        source: 'https://glow.org',
        week: glow.week,
        powerOutputKwh: glow.powerOutput,
        carbonCreditsTons: glow.carbon,
        activeFarms: glow.activeFarms,
        fetchedAt: glow.fetchedAt,
        degraded: glow.degraded,
      },
      gainforest: {
        source: 'https://www.gainforest.app',
        certifiedOrgs: gainforest.certifiedOrgs,
        bumicerts: gainforest.bumicerts,
        observations: gainforest.observations,
        fetchedAt: gainforest.fetchedAt,
        degraded: gainforest.degraded,
      },
      maEarth: {
        source: 'https://maearth.com',
        round: maEarth.round,
        donationsUsd: maEarth.donations,
        donors: maEarth.donors,
        projects: maEarth.projects,
        matchingPoolUsd: maEarth.matchingPool,
        fetchedAt: maEarth.fetchedAt,
        degraded: maEarth.degraded,
      },
      fundingTheCommons: {
        source: 'https://fundingthecommons.io',
        ...ftc.totals,
        asOf: ftc.asOf,
        fetchedAt: ftc.fetchedAt,
        degraded: ftc.degraded,
      },
    },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
  )
}

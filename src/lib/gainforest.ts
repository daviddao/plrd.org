import "server-only"
import { type MetricSeries, cumulativeOnAxis, dayAxis, ms } from "./trends"

/**
 * Read-only counts for the GainForest commons, surfaced on the FA2 Live
 * Dashboard:
 *
 *   · certified organizations  → `appCertifiedActorOrganization`
 *   · Bumicerts (hypercerts)   → `orgHypercertsClaimActivity`
 *
 * from the Hyperindex GraphQL API (hi.gainforest.app, CORS-open), cached via
 * Next ISR. A flaky upstream yields 0 + `degraded: true` rather than failing
 * the page. The dashboard *map* is a build-time snapshot of certified-org
 * locations (see `scripts/generate-gainforest-sites.mjs` →
 * `src/data/gainforest-sites.json`), not fetched here.
 */

const GAINFOREST_INDEXER_URL =
  process.env.GAINFOREST_INDEXER_URL ?? "https://hi.gainforest.app/graphql"

// 15-minute ISR — matches gainforest-app / Bumiscan's own cadence.
const REVALIDATE = 60 * 15

/** Cumulative daily series for the GainForest headline metrics. */
export type GainforestTrends = {
  certifiedOrgs: MetricSeries
  bumicerts: MetricSeries
}

export type GainforestStats = {
  certifiedOrgs: number
  bumicerts: number
  trends: GainforestTrends
  fetchedAt: string
  degraded: boolean
}

const EMPTY_TRENDS: GainforestTrends = {
  certifiedOrgs: { days: [], values: [] },
  bumicerts: { days: [], values: [] },
}

// `first: 1000` returns every record today (410 orgs, 815 claims) in one round
// trip; `totalCount` stays authoritative for the headline number regardless.
const TOTALS_QUERY = `query PlrdGainforestTotals {
  actorOrg: appCertifiedActorOrganization(first: 1000) {
    totalCount
    edges { node { createdAt } }
  }
  act: orgHypercertsClaimActivity(first: 1000) {
    totalCount
    edges { node { createdAt } }
  }
}`

type EdgeList = { edges?: { node?: { createdAt?: string | null } | null }[] | null }

function times(conn: EdgeList | undefined): number[] {
  return (conn?.edges ?? [])
    .map((e) => ms(e?.node?.createdAt))
    .filter((t) => !Number.isNaN(t))
}

export async function fetchGainforestStats(): Promise<GainforestStats> {
  try {
    const res = await fetch(GAINFOREST_INDEXER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      next: { revalidate: REVALIDATE, tags: ["gainforest"] },
      body: JSON.stringify({ query: TOTALS_QUERY }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const json = (await res.json()) as {
      data?: {
        actorOrg?: ({ totalCount?: number | null } & EdgeList) | null
        act?: ({ totalCount?: number | null } & EdgeList) | null
      }
    }
    const d = json.data
    if (!d) throw new Error("no data")

    const orgTimes = times(d.actorOrg ?? undefined)
    const actTimes = times(d.act ?? undefined)
    const { days, isoDays } = dayAxis([...orgTimes, ...actTimes])
    const trends: GainforestTrends = {
      certifiedOrgs: {
        days: isoDays,
        values: cumulativeOnAxis(days, orgTimes.map((t) => ({ t, inc: 1 }))),
      },
      bumicerts: {
        days: isoDays,
        values: cumulativeOnAxis(days, actTimes.map((t) => ({ t, inc: 1 }))),
      },
    }

    return {
      certifiedOrgs: d.actorOrg?.totalCount ?? 0,
      bumicerts: d.act?.totalCount ?? 0,
      trends,
      fetchedAt: new Date().toISOString(),
      degraded: false,
    }
  } catch (err) {
    console.warn("[gainforest] totals fetch failed:", err)
    return {
      certifiedOrgs: 0,
      bumicerts: 0,
      trends: EMPTY_TRENDS,
      fetchedAt: new Date().toISOString(),
      degraded: true,
    }
  }
}

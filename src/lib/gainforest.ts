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
  /** Recent cumulative tail (newest ~1000 occurrence records) anchored to the
   *  true total. Species observations (~330k) can't be charted in full at
   *  request time, so we surface the recent growth slope from one cheap page,
   *  mirroring the gainforest-explorer landing band. */
  observations: MetricSeries
}

export type GainforestStats = {
  certifiedOrgs: number
  bumicerts: number
  /** Live total of Darwin Core occurrence records (species observations). */
  observations: number
  trends: GainforestTrends
  fetchedAt: string
  degraded: boolean
}

const EMPTY_TRENDS: GainforestTrends = {
  certifiedOrgs: { days: [], values: [] },
  bumicerts: { days: [], values: [] },
  observations: { days: [], values: [] },
}

/**
 * Cumulative series for the recent tail of a large collection: the running
 * total of the newest `times.length` records, offset so the last point equals
 * the real `total`. Used for species observations, whose full per-day history
 * (~330k records) is too expensive to build in request time but whose newest
 * page is cheap — the line shows the recent growth slope ending at the live
 * total. (Ports gainforest-explorer's `cumulativeTailSeries`.)
 */
function tailSeries(times: number[], total: number): MetricSeries {
  const valid = times.filter((t) => !Number.isNaN(t))
  const { days, isoDays } = dayAxis(valid)
  if (days.length === 0) return { days: [], values: [] }
  const baseline = total - valid.length
  const values = cumulativeOnAxis(
    days,
    valid.map((t) => ({ t, inc: 1 })),
    baseline,
  )
  return { days: isoDays, values }
}

// `first: 1000` returns every record today (410 orgs, 815 claims) in one round
// trip; `totalCount` stays authoritative for the headline number regardless.
// `occ` pulls only the newest 1000 occurrence timestamps (sorted DESC) + the
// true `totalCount` — enough for the headline number plus a recent-activity
// tail sparkline, without scanning all ~330k records.
const TOTALS_QUERY = `query PlrdGainforestTotals {
  actorOrg: appCertifiedActorOrganization(first: 1000) {
    totalCount
    edges { node { createdAt } }
  }
  act: orgHypercertsClaimActivity(first: 1000) {
    totalCount
    edges { node { createdAt } }
  }
  occ: appGainforestDwcOccurrence(first: 1000, sortBy: createdAt, sortDirection: DESC) {
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
        occ?: ({ totalCount?: number | null } & EdgeList) | null
      }
    }
    const d = json.data
    if (!d) throw new Error("no data")

    const orgTimes = times(d.actorOrg ?? undefined)
    const actTimes = times(d.act ?? undefined)
    const occTimes = times(d.occ ?? undefined)
    const observations = d.occ?.totalCount ?? 0
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
      // Recent-activity tail: newest ~1000 occurrences anchored to the true total.
      observations: tailSeries(occTimes, observations),
    }

    return {
      certifiedOrgs: d.actorOrg?.totalCount ?? 0,
      bumicerts: d.act?.totalCount ?? 0,
      observations,
      trends,
      fetchedAt: new Date().toISOString(),
      degraded: false,
    }
  } catch (err) {
    console.warn("[gainforest] totals fetch failed:", err)
    return {
      certifiedOrgs: 0,
      bumicerts: 0,
      observations: 0,
      trends: EMPTY_TRENDS,
      fetchedAt: new Date().toISOString(),
      degraded: true,
    }
  }
}

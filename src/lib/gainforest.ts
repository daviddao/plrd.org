import "server-only"

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

export type GainforestStats = {
  certifiedOrgs: number
  bumicerts: number
  fetchedAt: string
  degraded: boolean
}

const TOTALS_QUERY = `query PlrdGainforestTotals {
  actorOrg: appCertifiedActorOrganization(first: 0) { totalCount }
  act: orgHypercertsClaimActivity(first: 0) { totalCount }
}`

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
        actorOrg?: { totalCount?: number | null }
        act?: { totalCount?: number | null }
      }
    }
    const d = json.data
    if (!d) throw new Error("no data")
    return {
      certifiedOrgs: d.actorOrg?.totalCount ?? 0,
      bumicerts: d.act?.totalCount ?? 0,
      fetchedAt: new Date().toISOString(),
      degraded: false,
    }
  } catch (err) {
    console.warn("[gainforest] totals fetch failed:", err)
    return { certifiedOrgs: 0, bumicerts: 0, fetchedAt: new Date().toISOString(), degraded: true }
  }
}

import "server-only"

/**
 * Read-only Ma Earth crowdfunding stats for the FA2 Live Dashboard: total live
 * donations across every project in the current quadratic-funding round, plus
 * the matching-pool size that sits next to it.
 *
 * Ma Earth's public app talks to an oRPC endpoint at `/rpc`. Each procedure is
 * POSTed as `{"json": <input>}` and answers `{"json": <output>}`. We use three
 * public procedures:
 *
 *   · rounds.getCurrent            → the active round ({ id, name, ... })
 *   · rounds.getMatchingEstimates  → per-project QF computation for that round;
 *                                    `estE` sums to the pool, and each project's
 *                                    `directDonations` (cents) + `donorCount`
 *                                    are the live crowdfunding totals.
 *   · rounds.getMatchingPoolOrNull → the pool record; `algorithm_params
 *                                    .matching_funds` (cents) is the base pool.
 *
 * We sum `directDonations`/`donorCount` across the round's projects — the same
 * matching-eligible set whose `estE` totals the pool — to get round donations
 * across all projects. This round-scoped figure runs a little below
 * maearth.com's headline banner, which adds donor-covered processing fees via
 * the operator-only (auth-gated) `rounds.getStats`.
 *
 * A flaky/empty upstream yields 0 + `degraded: true` rather than failing the
 * page — same contract as fetchGainforestStats / fetchGlowStats / fetchFtcStats.
 */

const MAEARTH_RPC_BASE =
  process.env.MAEARTH_RPC_BASE ?? "https://maearth.com/rpc"

// A browser-like UA — the edge in front of Ma Earth 403s some default
// server-side agents.
const UA =
  "Mozilla/5.0 (compatible; plresearch-dashboard/1.0; +https://www.plrd.org)"

// 15-minute ISR — donation totals drift slowly; the dashboard page also caps
// its own revalidate window.
const REVALIDATE = 60 * 15

// Fallback pool when the pool record can't be read: Round 3 base is $1M.
const FALLBACK_POOL_USD = 1_000_000

export type MaEarthStats = {
  /** Active round name, e.g. "Round 3". */
  round: string
  /** Total live crowdfunding donations across the round's projects (USD). */
  donations: number
  /** Total donors across the round's projects. */
  donors: number
  /** Number of projects in the round's matching computation. */
  projects: number
  /** Base quadratic-funding matching pool for the round (USD). */
  matchingPool: number
  fetchedAt: string
  degraded: boolean
}

type Round = { id: string; name?: string | null }
type MatchingEstimates = {
  projects?: { directDonations?: number | null; donorCount?: number | null }[] | null
}
type MatchingPool = {
  algorithm_params?: { matching_funds?: number | null } | null
}

/** POST one oRPC procedure. oRPC wraps I/O in a `{ json }` envelope and can
 *  answer non-2xx with a valid body; parse regardless and only fail when the
 *  `json` payload is truly absent. */
async function rpc<T>(procedure: string, input: unknown): Promise<T> {
  const res = await fetch(`${MAEARTH_RPC_BASE}/${procedure}`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": UA },
    next: { revalidate: REVALIDATE, tags: ["maearth"] },
    body: JSON.stringify({ json: input }),
  })
  const body = (await res.json().catch(() => null)) as { json?: T } | null
  if (!body || body.json === undefined) {
    throw new Error(`maearth ${procedure}: status ${res.status}, no json`)
  }
  return body.json
}

export async function fetchMaEarthStats(): Promise<MaEarthStats> {
  try {
    const round = await rpc<Round>("rounds/getCurrent", {})
    if (!round?.id) throw new Error("no current round")

    const [estimates, pool] = await Promise.all([
      rpc<MatchingEstimates>("rounds/getMatchingEstimates", { id: round.id }),
      rpc<MatchingPool | null>("rounds/getMatchingPoolOrNull", {
        id: round.id,
      }).catch(() => null),
    ])

    const projects = estimates.projects ?? []
    const donationCents = projects.reduce((s, p) => s + (p.directDonations ?? 0), 0)
    const donors = projects.reduce((s, p) => s + (p.donorCount ?? 0), 0)
    const poolCents = pool?.algorithm_params?.matching_funds ?? null

    return {
      round: round.name ?? "Round 3",
      donations: Math.round(donationCents / 100),
      donors,
      projects: projects.length,
      matchingPool: poolCents != null ? Math.round(poolCents / 100) : FALLBACK_POOL_USD,
      fetchedAt: new Date().toISOString(),
      degraded: false,
    }
  } catch (err) {
    console.warn("[maearth] stats fetch failed:", err)
    return {
      round: "Round 3",
      donations: 0,
      donors: 0,
      projects: 0,
      matchingPool: FALLBACK_POOL_USD,
      fetchedAt: new Date().toISOString(),
      degraded: true,
    }
  }
}

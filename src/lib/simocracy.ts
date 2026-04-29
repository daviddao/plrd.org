import "server-only"

/**
 * Read-only client for the Simocracy indexer at
 *   https://simocracy-indexer-production.up.railway.app/graphql
 *
 * Powers the FA2 Live Dashboard. We pull three collections
 * (history, sim, gathering) and aggregate them into a small set of
 * headline metrics + a 14-day activity series + leaderboards.
 *
 * Schema mirrors simocracy-v2's `lib/indexer.ts` and `lib/lexicon-types.ts`,
 * but we deliberately keep this self-contained so plresearch.org doesn't
 * take a build-time dep on the simocracy-v2 source tree.
 *
 * Private fields (chat content, user prompts) are stripped before they ever
 * leave this module — the public dashboard only sees aggregate metadata.
 */

const SIMOCRACY_INDEXER_URL =
  process.env.SIMOCRACY_INDEXER_URL ??
  "https://simocracy-indexer-production.up.railway.app/graphql"

// -- FtC SF tower treasury (canonical example tower not yet represented as
// a gathering record). Mirrors TOWER_TREASURY in simocracy-v2/lib/ftc-sf-data.ts.
const FTC_SF_TOWER_TREASURY_USD = 15_000

// ---------------------------------------------------------------------------
// Lexicon shapes (subset)
// ---------------------------------------------------------------------------

export type SimocracyEvent =
  | {
      type: "chat"
      actorDid: string
      simNames: string[]
      simUris?: string[]
      createdAt: string
      hearingId?: string
      // chat content + userMessage are stripped before reaching this type
    }
  | {
      type: "sprocess"
      actorDid: string
      simNames: string[]
      simUris?: string[]
      createdAt: string
      proposalTitle?: string
      hearingId?: string
      round?: number
    }

type RawHistoryRecord = SimocracyEvent & {
  content?: string
  userMessage?: string
}

type RawGatheringRecord = {
  name?: string
  treasuryUsd?: number
  status?: string
  createdAt?: string
}

type RawSimRecord = {
  name?: string
  createdAt?: string
}

interface PageInfo {
  hasNextPage: boolean
  endCursor?: string
}

interface GqlResponse {
  data?: Record<
    string,
    { edges: { node: Record<string, unknown> }[]; pageInfo: PageInfo }
  >
  errors?: { message: string }[]
}

/**
 * Pull every node out of one of the Simocracy indexer's typed roots
 * (e.g. `orgSimocracyHistory`). The indexer uses lex-gql-style schema where
 * each lexicon collection becomes a top-level Relay connection — there is no
 * generic `records` query.
 *
 * Field names on `node` are the lexicon's record fields plus indexer-managed
 * fields (`uri`, `cid`, `did`, `collection`, `indexedAt`).
 */
async function fetchRoot<T extends Record<string, unknown>>(
  rootField: string,
  selection: string,
  limit: number,
): Promise<T[]> {
  const out: T[] = []
  let cursor: string | undefined = undefined
  while (out.length < limit) {
    const first = Math.min(100, limit - out.length)
    const after = cursor ? `, after: "${cursor}"` : ""
    const query = `{
      ${rootField}(first: ${first}${after}) {
        edges { node { ${selection} } }
        pageInfo { hasNextPage endCursor }
      }
    }`
    const res = await fetch(SIMOCRACY_INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60, tags: ["simocracy"] },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) break
    const json = (await res.json()) as GqlResponse
    if (json.errors?.length) {
      console.warn(`[simocracy] GraphQL errors for ${rootField}:`, json.errors)
      break
    }
    const conn = json.data?.[rootField]
    const edges = conn?.edges ?? []
    for (const e of edges) out.push(e.node as T)
    const page = conn?.pageInfo
    if (!page?.hasNextPage || !page.endCursor || page.endCursor === cursor) break
    cursor = page.endCursor
  }
  return out
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SimocracyTotals = {
  treasuryUsd: number
  uniqueHumans: number
  totalSims: number
  totalGatherings: number
  totalSProcesses: number
  totalChats: number
}

export type ActivityBucket = {
  /** ISO date (YYYY-MM-DD) at midnight local time. */
  date: string
  /** Total events on this day. */
  count: number
  /** Subset of `count` that are chat events. */
  chats: number
  /** Subset of `count` that are S-Process events. */
  sprocess: number
}

export type SimLeaderboardEntry = { name: string; chats: number }
export type UserLeaderboardEntry = { did: string; total: number; chats: number }

export type SimocracyStats = {
  totals: SimocracyTotals
  pulse14d: ActivityBucket[]
  topSims: SimLeaderboardEntry[]
  topUsers: UserLeaderboardEntry[]
  recentEvents: SimocracyEvent[]
  /** Best-effort wall-clock time the underlying GraphQL fetches completed. */
  fetchedAt: string
  /** True when the indexer was unreachable or returned no data. */
  degraded: boolean
}

function sanitize(raw: RawHistoryRecord): SimocracyEvent {
  // Strip private fields (chat content, user prompt) before they leak out.
  if (raw.type === "chat") {
    return {
      type: "chat",
      actorDid: raw.actorDid,
      simNames: raw.simNames ?? [],
      simUris: raw.simUris,
      createdAt: raw.createdAt,
      hearingId: raw.hearingId,
    }
  }
  return {
    type: "sprocess",
    actorDid: raw.actorDid,
    simNames: raw.simNames ?? [],
    simUris: raw.simUris,
    createdAt: raw.createdAt,
    proposalTitle: raw.proposalTitle,
    hearingId: raw.hearingId,
    round: raw.round,
  }
}

function bucket14d(events: SimocracyEvent[]): ActivityBucket[] {
  const days = 14
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: ActivityBucket[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toISOString().slice(0, 10),
      count: 0,
      chats: 0,
      sprocess: 0,
    }
  })
  const start = new Date(buckets[0].date).getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const end = start + days * dayMs
  for (const e of events) {
    const t = new Date(e.createdAt).getTime()
    if (Number.isNaN(t) || t < start || t >= end) continue
    const idx = Math.floor((t - start) / dayMs)
    const b = buckets[idx]
    if (!b) continue
    b.count += 1
    if (e.type === 'chat') b.chats += 1
    else if (e.type === 'sprocess') b.sprocess += 1
  }
  return buckets
}

/**
 * Fetch + aggregate Simocracy data for the live dashboard. Falls back to a
 * `degraded: true` empty result if the indexer is unreachable.
 */
export async function fetchSimocracyStats(): Promise<SimocracyStats> {
  type HistoryNode = RawHistoryRecord
  type SimNode = RawSimRecord & { did?: string; uri?: string }
  type GatheringNode = RawGatheringRecord & { did?: string }

  let historyNodes: HistoryNode[] = []
  let simNodes: SimNode[] = []
  let gatheringNodes: GatheringNode[] = []

  try {
    ;[historyNodes, simNodes, gatheringNodes] = await Promise.all([
      fetchRoot<HistoryNode>(
        "orgSimocracyHistory",
        "type actorDid simNames simUris proposalTitle round hearingId createdAt content userMessage",
        5_000,
      ),
      fetchRoot<SimNode>("orgSimocracySim", "did uri name createdAt", 1_000),
      fetchRoot<GatheringNode>(
        "orgSimocracyGathering",
        "did name treasuryUsd status createdAt",
        500,
      ),
    ])
  } catch (err) {
    console.warn("[simocracy] fetch failed:", err)
  }

  const events: SimocracyEvent[] = historyNodes
    .map((n) => sanitize(n))
    .filter((e) => !!e.createdAt)

  const gatherings = gatheringNodes

  // Treasury = sum(gathering.treasuryUsd) + canonical FtC SF tower
  const treasuryFromGatherings = gatherings.reduce(
    (s, g) => s + (typeof g.treasuryUsd === "number" ? g.treasuryUsd : 0),
    0,
  )
  const treasuryUsd = treasuryFromGatherings + FTC_SF_TOWER_TREASURY_USD

  // Unique humans = DIDs that own a sim ∪ DIDs that triggered any event
  const humanDids = new Set<string>()
  for (const node of simNodes) {
    if (node.did) humanDids.add(node.did)
  }
  for (const e of events) humanDids.add(e.actorDid)

  // S-processes = unique hearingId among sprocess events
  const sProcessRunIds = new Set<string>()
  for (const e of events) {
    if (e.type === "sprocess" && e.hearingId) sProcessRunIds.add(e.hearingId)
  }

  const totalChats = events.filter((e) => e.type === "chat").length

  // Leaderboards
  const chatBySim = new Map<string, number>()
  const eventsByUser = new Map<string, number>()
  const chatsByUser = new Map<string, number>()
  for (const e of events) {
    eventsByUser.set(e.actorDid, (eventsByUser.get(e.actorDid) ?? 0) + 1)
    if (e.type === "chat") {
      chatsByUser.set(e.actorDid, (chatsByUser.get(e.actorDid) ?? 0) + 1)
      for (const name of e.simNames) {
        chatBySim.set(name, (chatBySim.get(name) ?? 0) + 1)
      }
    }
  }

  const topSims: SimLeaderboardEntry[] = [...chatBySim.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, chats]) => ({ name, chats }))

  const topUsers: UserLeaderboardEntry[] = [...eventsByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([did, total]) => ({
      did,
      total,
      chats: chatsByUser.get(did) ?? 0,
    }))

  const recentEvents = [...events]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 25)

  const degraded =
    historyNodes.length === 0 &&
    simNodes.length === 0 &&
    gatheringNodes.length === 0

  return {
    totals: {
      treasuryUsd,
      uniqueHumans: humanDids.size,
      totalSims: simNodes.length,
      totalGatherings: gatheringNodes.length,
      totalSProcesses: sProcessRunIds.size,
      totalChats,
    },
    pulse14d: bucket14d(events),
    topSims,
    topUsers,
    recentEvents,
    fetchedAt: new Date().toISOString(),
    degraded,
  }
}

// ---------------------------------------------------------------------------
// Bluesky profile resolution (parallel, best-effort, server-side)
// ---------------------------------------------------------------------------

export type BlueskyProfile = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export async function resolveBlueskyProfiles(
  dids: string[],
): Promise<Record<string, BlueskyProfile>> {
  const out: Record<string, BlueskyProfile> = {}
  const unique = [...new Set(dids)].slice(0, 25)
  const results = await Promise.allSettled(
    unique.map(async (did) => {
      const r = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(5_000) },
      )
      if (!r.ok) return null
      const j = (await r.json()) as {
        handle: string
        displayName?: string
        avatar?: string
      }
      return {
        did,
        handle: j.handle,
        displayName: j.displayName,
        avatar: j.avatar,
      } satisfies BlueskyProfile
    }),
  )
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) out[r.value.did] = r.value
  }
  return out
}

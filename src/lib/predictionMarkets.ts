import mappingData from '@/data/prediction-markets.json'

export type MarketMatch = 'direct' | 'proxy' | 'gap'

export type MarketMapping = {
  area: string
  areaSlug: string
  opportunitySpace: string
  inflectionPoint: string
  match: MarketMatch
  market: {
    platform: string
    question: string
    slug: string
    url: string
    note: string
  }
}

export type LiveOdds = {
  yesPrice: number | null // 0..1
  question: string | null
  fetchedAt: string
}

export const predictionMarketMeta = (mappingData as { meta: { title: string; subtitle: string; disclaimer: string } }).meta
export const predictionMarketMappings = (mappingData as { mappings: MarketMapping[] }).mappings

const GAMMA = 'https://gamma-api.polymarket.com'

/**
 * Fetch the current "Yes" probability for a Polymarket event by slug.
 * Uses the public Gamma API (no auth). Returns the highest-priced Yes outcome
 * across the event's markets as a simple headline number for the prototype.
 */
export async function fetchPolymarketOdds(slug: string, hint?: string): Promise<LiveOdds> {
  const empty: LiveOdds = { yesPrice: null, question: null, fetchedAt: new Date().toISOString() }
  if (!slug) return empty
  try {
    const res = await fetch(`${GAMMA}/events?slug=${encodeURIComponent(slug)}`, {
      // Revalidate hourly so the page stays fresh without hammering the API.
      next: { revalidate: 3600 },
    })
    if (!res.ok) return empty
    const events = (await res.json()) as Array<{
      title?: string
      markets?: Array<{ question?: string; outcomes?: string; outcomePrices?: string }>
    }>
    const event = events?.[0]
    if (!event?.markets?.length) return empty

    // Parse every sub-market's Yes price once.
    const parsed = event.markets
      .map((m) => {
        const outcomes = safeParse(m.outcomes)
        const prices = safeParse(m.outcomePrices)
        if (!outcomes || !prices) return null
        const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === 'yes')
        if (yesIdx === -1) return null
        const yes = Number(prices[yesIdx])
        if (Number.isNaN(yes)) return null
        return { yes, question: m.question || event.title || '' }
      })
      .filter((x): x is { yes: number; question: string } => x != null)
    if (!parsed.length) return empty

    // If the mapping gives a hint (e.g. a "$75B" threshold), prefer the
    // sub-market whose question shares a distinctive token with it. This keeps
    // multi-threshold events (Neuralink valuation, etc.) on the right line
    // instead of defaulting to the near-certain lowest threshold.
    const token = hint ? distinctiveToken(hint) : null
    const pick =
      (token && parsed.find((m) => m.question.toLowerCase().includes(token))) ||
      parsed[0]
    return { yesPrice: pick.yes, question: pick.question, fetchedAt: new Date().toISOString() }
  } catch {
    return empty
  }
}

// Pull a distinctive token (a $-amount or number) from the mapping question
// to disambiguate multi-threshold events.
function distinctiveToken(s: string): string | null {
  const money = s.match(/\$[0-9]+(?:\.[0-9]+)?[bmk]?/i)
  if (money) return money[0].toLowerCase()
  const num = s.match(/[0-9]+m\b|[0-9]{2,}/i)
  return num ? num[0].toLowerCase() : null
}

function safeParse(s?: string): string[] | null {
  if (!s) return null
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map(String) : null
  } catch {
    return null
  }
}

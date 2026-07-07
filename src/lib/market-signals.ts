// Prediction-market "field" signal for each inflection point.
//
// Each inflection point can be paired with the prediction market that most
// closely matches its pre-registered threshold (Q2). The platform is chosen per
// point on match quality, NOT convenience:
//   - Polymarket — deepest liquidity for crypto/AI/identity/BCI-valuation themes.
//   - Kalshi     — regulated venue; better for US-regulatory / adoption-count themes.
//   - Metaculus  — reputation-weighted community forecasts for long-horizon,
//                  research-heavy bets no money market prices (e.g. WBE). Its API
//                  requires a token (METACULUS_API_TOKEN); without one we still
//                  link the question but show no live number.
//
// A market read is an *external, independent* estimate on the FIELD axis
// ("will it happen?") — it is never PL contribution (Q3) and never a settled Q2.
// Where no market exists, that gap is itself informative: the bet is early or
// contrarian enough that no one is pricing it yet.

export type Platform = 'polymarket' | 'kalshi' | 'metaculus'
export type SignalMatch = 'direct' | 'proxy' | 'gap'

type MarketRef =
  | { platform: 'polymarket'; slug: string; hint?: string; question: string; url: string }
  | { platform: 'kalshi'; ticker: string; question: string; url: string }
  | { platform: 'metaculus'; id: number; question: string; url: string }

export type MarketMapping = {
  /** Must match InflectionPoint.title exactly. */
  title: string
  match: SignalMatch
  /** Best-match market (drives the platform label). Omitted for gaps. */
  primary?: MarketRef
  /** Liquidity fallback used only if the primary returns no live price. */
  fallback?: MarketRef
  note: string
}

export type MarketSignal = {
  match: SignalMatch
  platform: Platform | null
  /** 0..1 crowd "yes" probability, or null when unavailable. */
  prob: number | null
  /** Total money traded through the market, in USD, or null when unavailable. */
  volume: number | null
  question: string | null
  url: string | null
  /** True when prob came from the fallback rather than the best-match market. */
  viaFallback: boolean
  note: string
}

// ── Mapping: inflection point → closest market ────────────────────────────────
export const MARKET_MAPPINGS: MarketMapping[] = [
  {
    title: 'Communication that cannot be switched off',
    match: 'gap',
    note: 'No liquid market prices a metadata-resistant messenger at scale or surviving a shutdown — a genuine white space.',
  },
  {
    title: 'Personhood without the state in the loop',
    match: 'proxy',
    primary: {
      platform: 'polymarket',
      slug: 'over-30m-humans-verified-on-world-network-by-december-31',
      question: 'Over 30M humans verified on World Network by Dec 31?',
      url: 'https://polymarket.com/event/over-30m-humans-verified-on-world-network-by-december-31',
    },
    note: 'Proof-of-human adoption at scale is the closest live analogue; Polymarket has the deepest World/identity liquidity.',
  },
  {
    title: 'Provenance becomes the default for truth',
    match: 'proxy',
    primary: {
      platform: 'kalshi',
      ticker: 'KXAILEGISLATION-27-JAN01',
      question: 'Will AI regulation become US law by 2027?',
      url: 'https://kalshi.com/markets/kxailegislation/ai-regulation',
    },
    note: 'Provenance mandates ride on AI regulation; Kalshi (regulated, US-policy focus) is the better-matched venue than any crypto market.',
  },
  {
    title: 'Agents run on open rails',
    match: 'proxy',
    primary: {
      platform: 'polymarket',
      slug: 'us-government-removes-public-access-to-another-major-ai-model-in-2026-20260703202936862',
      question: 'US government removes public access to another major AI model in 2026?',
      url: 'https://polymarket.com/event/us-government-removes-public-access-to-another-major-ai-model-in-2026-20260703202936862',
    },
    note: 'A contrarian, inverse read: if Washington moves to cut off public access to a major (open, largely Chinese) AI model, that is a headwind for open, permissionless rails — high odds here cut against this inflection point, not for it.',
  },
  {
    title: 'Programmable government in production',
    match: 'proxy',
    primary: {
      platform: 'polymarket',
      slug: 'over-30m-humans-verified-on-world-network-by-december-31',
      question: 'Over 30M humans verified on World Network by Dec 31?',
      url: 'https://polymarket.com/event/over-30m-humans-verified-on-world-network-by-december-31',
    },
    note: 'Shares the World market — “World becomes a mandated digital-identity layer” is one of our own DPI examples. No market yet prices $1B/yr on programmable rails directly.',
  },
  {
    title: 'A binding decision at scale',
    match: 'gap',
    note: 'No market prices a binding, at-scale computational decision. We already surface a live Simocracy signal here (Q3 contribution, not Q2).',
  },
  {
    title: 'Public goods become a financeable category',
    match: 'gap',
    note: 'No liquid market prices $1B/yr flowing through programmable allocation — long-horizon white space.',
  },
  {
    title: 'Capital that pays on verified outcomes',
    match: 'gap',
    note: 'No market prices a $1B+ outcomes-verified climate fund.',
  },
  {
    title: 'The BCI app store',
    match: 'proxy',
    primary: {
      platform: 'kalshi',
      ticker: 'KXNEURALINKCOUNT-26-40',
      question: 'Will Neuralink implant ≥40 people in 2026?',
      url: 'https://kalshi.com/markets/kxneuralinkcount/neuralink-count',
    },
    fallback: {
      platform: 'polymarket',
      slug: 'will-neuralinks-valuation-hit-by-december-31',
      hint: '$75B',
      question: "Will Neuralink's valuation hit $75B by Dec 31?",
      url: 'https://polymarket.com/event/will-neuralinks-valuation-hit-by-december-31',
    },
    note: 'Implant-count (Kalshi) is the best adoption/scaling proxy for a commercial BCI ecosystem; Polymarket valuation is the liquidity fallback.',
  },
  {
    title: 'Neural distillation',
    match: 'gap',
    note: 'No market prices neural-data distillation matching frontier reasoning — too early to be liquid.',
  },
  {
    title: 'The neuromorphic energy pivot',
    match: 'gap',
    note: 'No market prices a neuromorphic model matching SOTA at 1000× efficiency — pure white space.',
  },
  {
    title: 'Memory retrieval in simulation',
    match: 'proxy',
    primary: {
      platform: 'metaculus',
      id: 372,
      question: 'Will brain emulation be the first successful route to human-level AI?',
      url: 'https://www.metaculus.com/questions/372/brain-emulation-produces-first-human-ai/',
    },
    note: 'The closest live forecast: Metaculus’ long-running question on whether whole-brain emulation is the first route to human-level AI. A reputation-weighted community estimate (no money at stake), and the crowd prices this contrarian path in the low single digits.',
  },
]

export function mappingByTitle(): Record<string, MarketMapping> {
  return Object.fromEntries(MARKET_MAPPINGS.map((m) => [m.title, m]))
}

// ── Fetchers ─────────────────────────────────────────────────────────────────
const GAMMA = 'https://gamma-api.polymarket.com'
const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2'
const METACULUS = 'https://www.metaculus.com/api'
const METACULUS_TOKEN = process.env.METACULUS_API_TOKEN
const REVALIDATE = 3600

function safeParse(s?: string): string[] | null {
  if (!s) return null
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map(String) : null
  } catch {
    return null
  }
}

function distinctiveToken(s?: string): string | null {
  if (!s) return null
  const money = s.match(/\$[0-9]+(?:\.[0-9]+)?[bmk]?/i)
  if (money) return money[0].toLowerCase()
  const num = s.match(/[0-9]+m\b|[0-9]{2,}/i)
  return num ? num[0].toLowerCase() : null
}

type Quote = { prob: number; volume: number | null }

async function fetchPolymarket(slug: string, hint?: string): Promise<Quote | null> {
  try {
    const res = await fetch(`${GAMMA}/events?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return null
    const events = (await res.json()) as Array<{
      title?: string
      markets?: Array<{ question?: string; outcomes?: string; outcomePrices?: string; volumeNum?: number }>
    }>
    const markets = events?.[0]?.markets
    if (!markets?.length) return null
    const parsed = markets
      .map((m) => {
        const outcomes = safeParse(m.outcomes)
        const prices = safeParse(m.outcomePrices)
        if (!outcomes || !prices) return null
        const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === 'yes')
        if (yesIdx === -1) return null
        const yes = Number(prices[yesIdx])
        if (Number.isNaN(yes)) return null
        const volume = typeof m.volumeNum === 'number' && m.volumeNum > 0 ? m.volumeNum : null
        return { yes, volume, q: (m.question || '').toLowerCase() }
      })
      .filter((x): x is { yes: number; volume: number | null; q: string } => x != null)
    if (!parsed.length) return null
    const token = distinctiveToken(hint)
    const pick = (token && parsed.find((m) => m.q.includes(token))) || parsed[0]
    return { prob: pick.yes, volume: pick.volume }
  } catch {
    return null
  }
}

async function fetchKalshi(ticker: string): Promise<Quote | null> {
  try {
    const res = await fetch(`${KALSHI}/markets/${encodeURIComponent(ticker)}`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return null
    const m = ((await res.json()) as { market?: Record<string, number | null> }).market
    if (!m) return null
    // dollar_volume is in USD; volume is in contracts (each settles $0-$1), so the
    // contract count is a reasonable USD upper bound when no dollar figure is given.
    const dollarVol = m.dollar_volume
    const contractVol = m.volume
    const volume =
      typeof dollarVol === 'number' && dollarVol > 0
        ? dollarVol
        : typeof contractVol === 'number' && contractVol > 0
          ? contractVol
          : null
    // Prices are in cents (0-100). Prefer last trade, else the bid/ask midpoint.
    const last = m.last_price
    if (typeof last === 'number' && last > 0) return { prob: last / 100, volume }
    const bid = m.yes_bid
    const ask = m.yes_ask
    if (typeof bid === 'number' && typeof ask === 'number' && (bid > 0 || ask > 0)) {
      return { prob: (bid + ask) / 2 / 100, volume }
    }
    return null
  } catch {
    return null
  }
}

// Metaculus gates its API behind a token. With METACULUS_API_TOKEN set we read
// the recency-weighted community prediction for a binary question; without it,
// or on any failure, we return null and the caller still links the question
// (prob shows as “—”). Metaculus has no money at stake, so volume is always null.
async function fetchMetaculus(id: number): Promise<Quote | null> {
  if (!METACULUS_TOKEN) return null
  try {
    const res = await fetch(`${METACULUS}/posts/${id}/`, {
      headers: { Authorization: `Token ${METACULUS_TOKEN}` },
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return null
    const d = (await res.json()) as {
      question?: { aggregations?: { recency_weighted?: { latest?: { centers?: number[]; means?: number[] } } } }
    }
    const latest = d.question?.aggregations?.recency_weighted?.latest
    const center = latest?.centers?.[0] ?? latest?.means?.[0]
    const prob = typeof center === 'number' ? center : NaN
    if (Number.isNaN(prob)) return null
    return { prob, volume: null }
  } catch {
    return null
  }
}

async function fetchRef(ref: MarketRef): Promise<Quote | null> {
  switch (ref.platform) {
    case 'polymarket':
      return fetchPolymarket(ref.slug, ref.hint)
    case 'kalshi':
      return fetchKalshi(ref.ticker)
    case 'metaculus':
      return fetchMetaculus(ref.id)
  }
}

/** Resolve one mapping into a display-ready signal (best-match, with fallback). */
export async function resolveSignal(m: MarketMapping): Promise<MarketSignal> {
  if (m.match === 'gap' || !m.primary) {
    return { match: 'gap', platform: null, prob: null, volume: null, question: null, url: null, viaFallback: false, note: m.note }
  }
  const primary = await fetchRef(m.primary)
  if (primary != null) {
    return {
      match: m.match,
      platform: m.primary.platform,
      prob: primary.prob,
      volume: primary.volume,
      question: m.primary.question,
      url: m.primary.url,
      viaFallback: false,
      note: m.note,
    }
  }
  if (m.fallback) {
    const fb = await fetchRef(m.fallback)
    if (fb != null) {
      return {
        match: m.match,
        platform: m.fallback.platform,
        prob: fb.prob,
        volume: fb.volume,
        question: m.fallback.question,
        url: m.fallback.url,
        viaFallback: true,
        note: m.note,
      }
    }
  }
  // Market exists but no live price available — still link it.
  return {
    match: m.match,
    platform: m.primary.platform,
    prob: null,
    volume: null,
    question: m.primary.question,
    url: m.primary.url,
    viaFallback: false,
    note: m.note,
  }
}

/** Resolve every mapping, keyed by inflection-point title. */
export async function resolveAllSignals(): Promise<Record<string, MarketSignal>> {
  const entries = await Promise.all(
    MARKET_MAPPINGS.map(async (m) => [m.title, await resolveSignal(m)] as const),
  )
  return Object.fromEntries(entries)
}

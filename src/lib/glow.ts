import "server-only"
import { type MetricSeries } from "./trends"

/**
 * Read-only weekly solar metrics for the FA2 Live Dashboard, sourced from the
 * Glow protocol the same way glow.org/weekly-reports does:
 *
 *   POST {GLOW_API_URL}/headline_farm_stats
 *     body { urls: [GCA server url], week_number, with_full_data: false }
 *   → { numActiveFarms, filteredFarms[], rawData, multiplier }
 *
 * Each farm carries `powerOutput` (kWh for the week) and
 * `carbonCreditsProduced` (metric tons CO₂). We sum those across farms to get
 * the per-week totals glow.org renders, then build a rolling weekly activity
 * series (last `TREND_WEEKS` audited weeks) for the trend charts.
 *
 * The endpoint is CORS-open and deterministic. Genesis timestamp + week math
 * mirror glow.org's own client bundle. A flaky upstream yields 0 +
 * `degraded: true` rather than failing the page (same contract as
 * `fetchGainforestStats`).
 */

const GLOW_API_URL =
  process.env.GLOW_API_URL ?? "https://fun-rust-production.up.railway.app"
// Canonical GCA aggregation server queried by glow.org's weekly-reports page.
const GLOW_GCA_SERVER_URL =
  process.env.GLOW_GCA_SERVER_URL ?? "http://95.217.194.59:35015"

// Protocol week-0 start (unix seconds) + week length, from glow.org's bundle.
const GLOW_GENESIS = 1_700_352_000
const WEEK_SECONDS = 604_800
// Rolling window of recent protocol weeks to chart (~4 months of activity).
const TREND_WEEKS = 16
// 15-minute ISR — weekly data only changes once per protocol week.
const REVALIDATE = 60 * 15

/** Per-week activity series for the Glow headline metrics (last N weeks). */
export type GlowTrends = {
  /** Weekly power output (kWh). */
  powerOutput: MetricSeries
  /** Weekly carbon credits produced (metric tons CO₂). */
  carbon: MetricSeries
  /** Active solar farms reporting each week. */
  activeFarms: MetricSeries
}

export type GlowStats = {
  /** Latest audited protocol week number. */
  week: number
  /** Total power output for the latest week (kWh). */
  powerOutput: number
  /** Total carbon credits produced for the latest week (metric tons CO₂). */
  carbon: number
  /** Active farms reporting in the latest week. */
  activeFarms: number
  trends: GlowTrends
  fetchedAt: string
  degraded: boolean
}

type FarmNode = {
  powerOutput?: number | null
  carbonCreditsProduced?: number | null
}
type WeekResponse = {
  numActiveFarms?: number | null
  filteredFarms?: FarmNode[] | null
}
type WeekTotals = {
  week: number
  powerOutput: number
  carbon: number
  activeFarms: number
}

const EMPTY_TRENDS: GlowTrends = {
  powerOutput: { days: [], values: [] },
  carbon: { days: [], values: [] },
  activeFarms: { days: [], values: [] },
}

/** ISO date (YYYY-MM-DD) of a protocol week's start. */
function weekStartIso(week: number): string {
  return new Date((GLOW_GENESIS + week * WEEK_SECONDS) * 1000)
    .toISOString()
    .slice(0, 10)
}

/** Nominal current protocol week (the freshest week may not be audited yet). */
function currentWeek(): number {
  return Math.floor((Date.now() / 1000 - GLOW_GENESIS) / WEEK_SECONDS)
}

/** Fetch + aggregate one protocol week, or null when empty/unreachable. */
async function fetchWeek(week: number): Promise<WeekTotals | null> {
  if (week < 0) return null
  try {
    const res = await fetch(`${GLOW_API_URL}/headline_farm_stats`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      next: { revalidate: REVALIDATE, tags: ["glow"] },
      body: JSON.stringify({
        urls: [GLOW_GCA_SERVER_URL],
        week_number: week,
        with_full_data: false,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as WeekResponse
    const farms = json.filteredFarms ?? []
    if (farms.length === 0) return null
    const powerOutput = farms.reduce((s, f) => s + (f.powerOutput ?? 0), 0)
    const carbon = farms.reduce((s, f) => s + (f.carbonCreditsProduced ?? 0), 0)
    return {
      week,
      powerOutput,
      carbon,
      activeFarms: json.numActiveFarms ?? farms.length,
    }
  } catch {
    return null
  }
}

export async function fetchGlowStats(): Promise<GlowStats> {
  const nominal = currentWeek()
  // Request one extra week beyond the window: the freshest protocol week can
  // still be unaudited (empty), so we over-fetch and drop blanks.
  const weeks = Array.from({ length: TREND_WEEKS + 1 }, (_, i) => nominal - i)

  let results: WeekTotals[] = []
  try {
    results = (await Promise.all(weeks.map(fetchWeek)))
      .filter((w): w is WeekTotals => w !== null)
      .sort((a, b) => a.week - b.week)
  } catch (err) {
    console.warn("[glow] weekly stats fetch failed:", err)
  }

  if (results.length === 0) {
    return {
      week: nominal,
      powerOutput: 0,
      carbon: 0,
      activeFarms: 0,
      trends: EMPTY_TRENDS,
      fetchedAt: new Date().toISOString(),
      degraded: true,
    }
  }

  // Keep the most recent TREND_WEEKS once blanks are dropped, oldest → newest.
  const series = results.slice(-TREND_WEEKS)
  const days = series.map((w) => weekStartIso(w.week))
  const trends: GlowTrends = {
    powerOutput: { days, values: series.map((w) => Math.round(w.powerOutput)) },
    carbon: { days, values: series.map((w) => w.carbon) },
    activeFarms: { days, values: series.map((w) => w.activeFarms) },
  }
  const latest = series[series.length - 1]

  return {
    week: latest.week,
    powerOutput: latest.powerOutput,
    carbon: latest.carbon,
    activeFarms: latest.activeFarms,
    trends,
    fetchedAt: new Date().toISOString(),
    degraded: false,
  }
}

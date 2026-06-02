/**
 * Shared helpers for building cumulative daily metric series, used by both the
 * Simocracy and GainForest live-dashboard stats. Pure functions, no I/O.
 */

/** A cumulative daily time series for one metric. */
export type MetricSeries = {
  /** ISO date axis (YYYY-MM-DD), oldest → newest. */
  days: string[]
  /** Cumulative value at the end of each day. Same length as `days`. */
  values: number[]
}

export const DAY_MS = 24 * 60 * 60 * 1000

/** Parse an ISO date to epoch ms, or NaN. */
export function ms(iso: string | undefined | null): number {
  if (!iso) return NaN
  return new Date(iso).getTime()
}

/**
 * Build a shared day axis (day-start epoch ms + ISO strings) spanning the
 * earliest of `allTimes` through today. Returns empty axes when there's no
 * valid timestamp.
 */
export function dayAxis(allTimes: number[]): { days: number[]; isoDays: string[] } {
  const valid = allTimes.filter((t) => !Number.isNaN(t))
  if (valid.length === 0) return { days: [], isoDays: [] }

  const startDay = Math.floor(Math.min(...valid) / DAY_MS) * DAY_MS
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDay = today.getTime()

  const days: number[] = []
  for (let d = startDay; d <= endDay; d += DAY_MS) days.push(d)
  return { days, isoDays: days.map((d) => new Date(d).toISOString().slice(0, 10)) }
}

/**
 * Accumulate timestamped increments onto a shared day axis. `events` are
 * {t, inc} pairs; the returned array is the running total at the end of each
 * day in `days` (day-start epoch ms), seeded with `baseline`.
 */
export function cumulativeOnAxis(
  days: number[],
  events: { t: number; inc: number }[],
  baseline = 0,
): number[] {
  const sorted = [...events].filter((e) => !Number.isNaN(e.t)).sort((a, b) => a.t - b.t)
  const out: number[] = []
  let i = 0
  let acc = baseline
  for (const day of days) {
    const cutoff = day + DAY_MS
    while (i < sorted.length && sorted[i].t < cutoff) {
      acc += sorted[i].inc
      i++
    }
    out.push(acc)
  }
  return out
}

/** Round a value up to a clean axis bound (1/2/5 × 10ⁿ). */
export function niceMax(v: number): number {
  if (v <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

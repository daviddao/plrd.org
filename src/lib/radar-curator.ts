// Live PL R&D Radar — pulled from the crowd-curation service.
//
// The public Radar shown on /insights mirrors what curators have voted onto the
// current edition in the Radar Curator dashboard
// (https://plrd-radar-curator.fly.dev/dashboard#radar). We fetch the *general
// published cut* — the same confidence-aware, diversity-balanced selection the
// dashboard renders with no lens — so the site and the dashboard never drift.
//
// The curator's `/api/radar.json` items already match the `RadarItem` shape used
// by the PLRadar component, so no transformation is needed beyond dropping the
// extra scoring fields (`_rating`, `_rd`, `_score`) it tacks on.
//
// If the service is unreachable at build/request time we return null so the page
// can fall back to its locally-computed pool (recency + hand-picked signals) and
// the build never breaks.

import type { RadarItem } from '@/components/PLRadar'

const CURATOR_RADAR_URL =
  process.env.NEXT_PUBLIC_RADAR_CURATOR_URL?.replace(/\/$/, '') ??
  'https://plrd-radar-curator.fly.dev'

export type CuratedRadar = { edition: string; items: RadarItem[] }

/**
 * Fetch the current edition's Radar cut from the curator service. Returns null
 * on any failure (network, non-200, empty pool, malformed payload) so callers
 * can fall back gracefully. Revalidated hourly so new votes flow to the site.
 */
export async function fetchCuratedRadar(limit = 6): Promise<CuratedRadar | null> {
  try {
    const res = await fetch(`${CURATOR_RADAR_URL}/api/radar.json?limit=${limit}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      label?: string
      edition?: string
      items?: Array<RadarItem & { _rating?: number; _rd?: number; _score?: number }>
    }
    if (!Array.isArray(data.items) || data.items.length === 0) return null

    const items: RadarItem[] = data.items
      .filter((i) => i && i.key && i.title && i.href)
      .map((i) => ({
        key: i.key,
        title: i.title,
        description: i.description,
        href: i.href,
        external: !!i.external,
        type: i.type,
        areaLabel: i.areaLabel,
        areaSlug: i.areaSlug,
        date: i.date,
        image: i.image,
      }))
    if (items.length === 0) return null

    return { edition: data.label || 'Radar', items }
  } catch {
    return null
  }
}

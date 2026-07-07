'use client'

import { useEffect, useState } from 'react'
import { ContentTile, ContentTileGrid, type ContentTileData } from '@/components/ContentTile'
import { FilterPill } from '@/components/FilterPill'
import type { AreaIconType } from '@/components/AreaIcons'

// Focus-area slug → icon, matching the mapping used on the Insights explorer.
const AREA_ICON: Record<string, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  neurotech: 'brain',
}

export type AreaDef = { slug: string; title: string }
export type FilterableTile = ContentTileData & { key: string; areas: string[] }

const ALL = 'all'

/**
 * Listing view with a focus-area pill filter on top. Used by the /blog,
 * /publications and /talks pages so visitors arriving from the Insights
 * "All …" links can keep filtering by focus area on the subpages.
 */
export default function AreaFilteredListing({
  areas,
  tiles,
  noun = 'items',
  showAreaIcon = true,
}: {
  areas: AreaDef[]
  tiles: FilterableTile[]
  /** Plural noun for the empty state, e.g. "publications". */
  noun?: string
  showAreaIcon?: boolean
}) {
  const [area, setArea] = useState<string>(ALL)

  // Preselect the focus area passed via ?area=<slug> (e.g. arriving from the
  // Insights "All …" links). Done in an effect so SSR/hydration both start on
  // ALL and static prerendering is preserved. Unknown slugs are ignored.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('area')
    if (requested && areas.some((a) => a.slug === requested)) setArea(requested)
  }, [areas])

  const matchArea = (t: FilterableTile, a: string) => a === ALL || t.areas.includes(a)
  const areaCount = (slug: string) =>
    slug === ALL ? tiles.length : tiles.filter((t) => matchArea(t, slug)).length

  const shown = tiles.filter((t) => matchArea(t, area))
  const areaChips = [{ slug: ALL, title: 'All areas' }, ...areas]
  const activeAreaTitle = areas.find((a) => a.slug === area)?.title

  return (
    <div>
      {/* Focus-area filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {areaChips.map((a) => {
          const count = areaCount(a.slug)
          return (
            <FilterPill
              key={a.slug}
              label={a.title}
              count={a.slug === ALL ? undefined : count}
              active={area === a.slug}
              disabled={a.slug !== ALL && count === 0}
              onClick={() => setArea(a.slug)}
            />
          )
        })}
      </div>

      {shown.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">
            No {noun}
            {activeAreaTitle ? ` tagged ${activeAreaTitle}` : ''} yet.
          </p>
          <button
            type="button"
            onClick={() => setArea(ALL)}
            className="mt-3 text-blue hover:underline text-sm cursor-pointer"
          >
            Clear area filter
          </button>
        </div>
      ) : (
        <ContentTileGrid>
          {shown.map(({ key, areas: tileAreas, ...tile }) => {
            const iconSlug = showAreaIcon ? tileAreas.find((a) => AREA_ICON[a]) : undefined
            return <ContentTile key={key} {...tile} areaIcon={iconSlug ? AREA_ICON[iconSlug] : undefined} />
          })}
        </ContentTileGrid>
      )}
    </div>
  )
}

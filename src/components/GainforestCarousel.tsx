'use client'

import { useEffect, useState } from 'react'
import {
  fetchRecentCollections,
  countryFlag,
  type GainforestCollection,
} from '@/lib/gainforest-collections'

/**
 * Dynamic, client-side specimen marquee of the most recent GainForest data
 * collections (Darwin Core occurrence records with photos). Fetches the
 * indexer on mount and resolves each record's PDS blob image in the browser.
 *
 * Rendered as two rows of small square cards auto-scrolling in opposite
 * directions (top → left, bottom → right), seamless because each row renders
 * its cards twice and the CSS marquee shifts by -50%. Pauses on hover.
 * Ported from gainforest-app/decks/swissnex-2026's specimen wall.
 */
export default function GainforestCarousel({ limit = 100 }: { limit?: number }) {
  const [items, setItems] = useState<GainforestCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetchRecentCollections(limit, ctrl.signal)
      .then((recs) => setItems(recs))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to load collections')
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [limit])

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 text-center">
        <p className="text-sm text-gray-600">Couldn&apos;t reach the GainForest indexer.</p>
        <p className="mt-1 text-xs text-gray-400">{error}</p>
      </div>
    )
  }

  // Split across two rows; each row's cards render twice for a seamless loop.
  const rowA = items.filter((_, i) => i % 2 === 0)
  const rowB = items.filter((_, i) => i % 2 === 1)

  return (
    <div className="gf-wall relative overflow-hidden border-y border-gray-100 py-2">
      <MarqueeRow items={rowA} dir="left" loading={loading} />
      <div className="h-2" aria-hidden="true" />
      <MarqueeRow items={rowB} dir="right" loading={loading} />
    </div>
  )
}

function MarqueeRow({
  items,
  dir,
  loading,
}: {
  items: GainforestCollection[]
  dir: 'left' | 'right'
  loading: boolean
}) {
  if (loading && items.length === 0) {
    return (
      <div className="flex h-28 gap-2 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square h-full shrink-0 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }
  // Render twice so the -50% marquee translate loops seamlessly.
  const doubled = [...items, ...items]
  return (
    <div className="h-28 overflow-hidden">
      <div className={`gf-track ${dir === 'left' ? 'gf-track-left' : 'gf-track-right'} inline-flex h-full gap-2`}>
        {doubled.map((item, i) => (
          <SpecimenCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}

function SpecimenCard({ item }: { item: GainforestCollection }) {
  const name = item.vernacularName || item.scientificName || 'Unidentified'
  const flag = countryFlag(item.countryCode)
  return (
    <a
      href={item.recordUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${name}${item.locality ? ` · ${item.locality}` : ''}`}
      className="group relative block aspect-square h-full shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element — next/image optimization is off project-wide
        <img
          src={item.imageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {flag && (
        <span className="absolute left-1 top-1 z-10 text-[11px] drop-shadow">{flag}</span>
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-1.5 pb-1 pt-5">
        <div className="truncate text-[10px] font-medium italic leading-tight text-white">{name}</div>
        {item.locality && (
          <div className="truncate text-[8px] leading-tight text-white/70">{item.locality}</div>
        )}
      </div>
    </a>
  )
}

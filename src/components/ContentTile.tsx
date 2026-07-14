import Link from 'next/link'
import type { ReactNode } from 'react'
import { AreaIcon, type AreaIconType } from './AreaIcons'

export type ContentTileData = {
  href: string
  eyebrow?: string
  title: string
  description?: string
  external?: boolean
  /** Optional content-type tag shown at the top of the card (e.g. in the unified Insights feed). */
  badge?: string
  /** Optional focus-area icon shown in the top-right corner of the card. */
  areaIcon?: AreaIconType
  /**
   * Optional cover/hero image shown as a media header at the top of the card.
   * - `undefined` → text-only card (default; backward compatible).
   * - `''`        → media header with a procedural gradient fallback.
   * - a URL       → media header showing that cover image.
   */
  image?: string
}

/**
 * Shared listing/insights card. Single source of truth for the tile look used
 * on the Insights explorer and the /publications, /talks, /blog, /tutorials
 * listing pages so the tile view persists across "All …" links.
 */
export function ContentTile({ href, eyebrow, title, description, external, badge, areaIcon, image }: ContentTileData) {
  const hasMedia = image !== undefined
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex flex-col justify-start h-full border border-gray-200 rounded-lg overflow-hidden hover:border-blue hover:shadow-sm transition-all"
    >
      {hasMedia &&
        (image ? (
          <div
            className="h-40 bg-cover bg-center bg-gray-100"
            style={{ backgroundImage: `url('${image}')` }}
          />
        ) : (
          <div className="h-40 relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1982F433]">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 40%, #1982F4 1px, transparent 1px), radial-gradient(circle at 70% 60%, #1982F4 1px, transparent 1px)',
                backgroundSize: '24px 24px, 32px 32px',
              }}
            />
          </div>
        ))}
      <div className="flex flex-col justify-start flex-1 p-5">
      {(badge || areaIcon) && (
        <div className="flex items-start justify-between gap-2 mb-2">
          {badge ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {badge}
            </span>
          ) : (
            <span />
          )}
          {areaIcon && (
            <AreaIcon
              type={areaIcon}
              className="w-6 h-6 shrink-0 text-gray-400 group-hover:text-blue transition-colors duration-200"
            />
          )}
        </div>
      )}
      {eyebrow && <div className="text-xs text-gray-400 mb-2">{eyebrow}</div>}
      <h3 className="text-base font-medium text-black leading-snug group-hover:text-blue transition-colors">
        {title}
        {external && <span className="text-gray-400 text-xs ml-1.5">↗</span>}
      </h3>
      {description && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{description}</p>}
      </div>
    </Link>
  )
}

/** Responsive 1/2/3-column grid wrapper matching the Insights tile layout. */
export function ContentTileGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
}

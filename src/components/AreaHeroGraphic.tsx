'use client'

import { useRef } from 'react'
import eg from '@/data/area-heroes/economies-governance.json'
import dhr from '@/data/area-heroes/digital-human-rights.json'
import ai from '@/data/area-heroes/ai-robotics.json'
import neuro from '@/data/area-heroes/neurotech.json'

/**
 * Decorative, interactive focus-area hero graphic.
 *
 * The area's hero render shows crisp. On hover, a cursor-following lens reveals
 * a hexagon "pixelation" of exactly the area under the mouse — each tile colours
 * itself from the underlying image pixels (the transparent background is cut
 * out, so the effect only ever lands on the subject). Tiles are drawn slightly
 * overlapping, so there are no white seams.
 *
 * Per-tile colours + geometry + the tight crop frame are pre-computed by
 * `scripts/generate-area-hero-mosaics.mjs` into `src/data/area-heroes/<slug>.json`.
 * The lens is an SVG radial-gradient mask whose centre we move imperatively on
 * mousemove, so the polygons never re-render.
 */
type Mosaic = {
  viewBox: string
  frame: { x: number; y: number; w: number; h: number }
  image: { x: number; y: number; w: number; h: number }
  href: string
  hexes: { p: string; f: string }[]
}

const MOSAICS: Record<string, Mosaic> = {
  'economies-governance': eg,
  'digital-human-rights': dhr,
  'ai-robotics': ai,
  'neurotech': neuro,
}

const LENS_R = 150 // lens radius in viewBox units

export default function AreaHeroGraphic({ slug, className }: { slug: string; className?: string }) {
  const mosaic = MOSAICS[slug]
  const svgRef = useRef<SVGSVGElement>(null)
  const gradRef = useRef<SVGRadialGradientElement>(null)
  const lensRef = useRef<SVGGElement>(null)
  if (!mosaic) return null

  const { viewBox, frame, image, href, hexes } = mosaic

  function moveLens(clientX: number, clientY: number) {
    const svg = svgRef.current
    const grad = gradRef.current
    if (!svg || !grad) return
    const rect = svg.getBoundingClientRect()
    const x = frame.x + ((clientX - rect.left) / rect.width) * frame.w
    const y = frame.y + ((clientY - rect.top) / rect.height) * frame.h
    grad.setAttribute('cx', String(x))
    grad.setAttribute('cy', String(y))
    if (lensRef.current) lensRef.current.style.opacity = '1'
  }

  function hideLens() {
    if (lensRef.current) lensRef.current.style.opacity = '0'
  }

  return (
    <div className={className} style={{ aspectRatio: `${frame.w} / ${frame.h}` }}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={(e) => moveLens(e.clientX, e.clientY)}
        onMouseLeave={hideLens}
        onTouchMove={(e) => {
          const t = e.touches[0]
          if (t) moveLens(t.clientX, t.clientY)
        }}
        onTouchEnd={hideLens}
      >
        <defs>
          <radialGradient id={`areaLens-${slug}`} ref={gradRef} gradientUnits="userSpaceOnUse" cx={-9999} cy={-9999} r={LENS_R}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id={`areaLensMask-${slug}`}>
            <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} fill={`url(#areaLens-${slug})`} />
          </mask>
        </defs>

        {/* Crisp render. */}
        <image
          href={href}
          x={image.x}
          y={image.y}
          width={image.w}
          height={image.h}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Hexagon pixelation, revealed only under the cursor lens. */}
        <g ref={lensRef} mask={`url(#areaLensMask-${slug})`} style={{ opacity: 0, transition: 'opacity 250ms ease' }}>
          {hexes.map((hx, i) => (
            <polygon key={i} points={hx.p} fill={hx.f} />
          ))}
        </g>
      </svg>
    </div>
  )
}

'use client'

import { useRef } from 'react'
import mosaic from '@/data/fa2/hero-mosaic.json'

/**
 * Decorative, interactive hero graphic for the Economies & Governance area.
 *
 * The temple render shows crisp. On hover, a cursor-following lens reveals a
 * hexagon "pixelation" of exactly the area under the mouse — each tile colours
 * itself from the underlying image pixels (the white background is cut out, so
 * the effect only ever lands on the building). Tiles are drawn slightly
 * overlapping, so there are no white seams.
 *
 * Per-tile colours + geometry are pre-computed by
 * `scripts/generate-fa2-hero-mosaic.mjs` into `hero-mosaic.json`. The lens is
 * an SVG radial-gradient mask whose centre we move imperatively on mousemove,
 * so the 150-odd polygons never re-render.
 */
const LENS_R = 150 // lens radius in viewBox units

export default function FA2HeroGraphic({ className }: { className?: string }) {
  const { viewBox, frame, image, hexes } = mosaic
  const svgRef = useRef<SVGSVGElement>(null)
  const gradRef = useRef<SVGRadialGradientElement>(null)
  const lensRef = useRef<SVGGElement>(null)

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
    <div className={className}>
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
          <radialGradient ref={gradRef} id="fa2Lens" gradientUnits="userSpaceOnUse" cx={-999} cy={-999} r={LENS_R}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="fa2LensMask">
            <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} fill="url(#fa2Lens)" />
          </mask>
        </defs>

        {/* Crisp temple. */}
        <image
          href="/images/fa2/fa2-hero.png"
          x={image.x}
          y={image.y}
          width={image.w}
          height={image.h}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Hexagon pixelation, revealed only under the cursor lens. */}
        <g ref={lensRef} mask="url(#fa2LensMask)" style={{ opacity: 0, transition: 'opacity 250ms ease' }}>
          {hexes.map((hx, i) => (
            <polygon key={i} points={hx.p} fill={hx.f} />
          ))}
        </g>
      </svg>
    </div>
  )
}

#!/usr/bin/env node
/**
 * Generate the hexagon-pixelation data for the focus-area hero graphics.
 *
 * Each focus area has a hero render (a transparent-background PNG). It shows
 * crisp; on hover a cursor-following lens reveals a hexagon "pixelation" of the
 * area underneath, every tile coloured from the underlying image pixels. The
 * transparent background is cut out via the alpha channel, so the mosaic only
 * ever lands on the subject, and the SVG frame is cropped tight to it so the
 * hover lens covers (almost) the whole graphic.
 *
 * Output: src/data/area-heroes/<slug>.json (committed to git). The site renders
 * these without ever needing sharp.
 *
 * sharp is intentionally NOT a project dependency. Install ad-hoc to regen:
 *   npm install --no-save sharp
 *   node scripts/generate-area-hero-mosaics.mjs
 */

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('\n[area-mosaic] sharp not installed. Run: npm install --no-save sharp\n')
  process.exit(1)
}
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'src/data/area-heroes')

const SOURCES = [
  { slug: 'economies-governance', file: 'fa2-hero.png' },
  { slug: 'digital-human-rights', file: 'digital-human-rights-hero.png' },
  { slug: 'ai-robotics', file: 'ai-robotics-hero.png' },
  { slug: 'neurotech', file: 'neurotech-hero.png' },
]

const W = 820 // working/display canvas width

// Flat-top hexagon grid.
const SIZE = 20 // centre → vertex (= side length)
const DRAW = SIZE + 0.8 // draw slightly larger so tiles overlap — no white seams
const STEP_X = SIZE * 1.5
const STEP_Y = SIZE * Math.sqrt(3)

const A_BG = 30 // alpha below this = transparent background
const A_SOLID = 110 // alpha at/above this = solid foreground (sampled for colour)

function hexPoints(cx, cy, size) {
  const pts = []
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k // flat-top: vertices at 0,60,120,...
    pts.push(`${(cx + size * Math.cos(a)).toFixed(1)},${(cy + size * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

// Average colour (composited over white) of solid foreground pixels in a patch.
function sample(data, w, h, px, py, rad) {
  let R = 0, G = 0, B = 0, n = 0, tot = 0
  const x0 = Math.max(0, Math.floor(px - rad))
  const x1 = Math.min(w - 1, Math.floor(px + rad))
  const y0 = Math.max(0, Math.floor(py - rad))
  const y1 = Math.min(h - 1, Math.floor(py + rad))
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      tot++
      const i = (y * w + x) * 4
      const a = data[i + 3]
      if (a < A_SOLID) continue
      const af = a / 255
      // composite over white so tiles match the displayed image
      R += data[i] * af + 255 * (1 - af)
      G += data[i + 1] * af + 255 * (1 - af)
      B += data[i + 2] * af + 255 * (1 - af)
      n++
    }
  }
  if (n === 0) return null
  return { r: Math.round(R / n), g: Math.round(G / n), b: Math.round(B / n), coverage: n / tot }
}

await mkdir(OUT_DIR, { recursive: true })

for (const { slug, file } of SOURCES) {
  const { data, info } = await sharp(join(ROOT, 'public/images/fa2', file))
    .resize({ width: W })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  // Foreground bounds (alpha-based cutout).
  let minX = w, maxX = 0, minY = h, maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] >= A_BG) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const PAD = 14
  const fx = Math.max(0, minX - PAD)
  const fy = Math.max(0, minY - PAD)
  const fw = Math.min(w, maxX + PAD) - fx
  const fh = Math.min(h, maxY + PAD) - fy

  const cols = Math.ceil(maxX / STEP_X) + 2
  const rows = Math.ceil(h / STEP_Y) + 2

  const hexes = []
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const cx = col * STEP_X
      const cy = row * STEP_Y + (col % 2 ? STEP_Y / 2 : 0)
      if (cx < minX - SIZE || cx > maxX + SIZE) continue
      const s = sample(data, w, h, cx, cy, SIZE * 0.62)
      if (!s || s.coverage < 0.12) continue // mostly transparent → skip (cut out the subject)
      hexes.push({ p: hexPoints(cx, cy, DRAW), f: `rgb(${s.r},${s.g},${s.b})` })
    }
  }

  const out = {
    viewBox: `${fx} ${fy} ${fw} ${fh}`,
    frame: { x: fx, y: fy, w: fw, h: fh },
    image: { x: 0, y: 0, w, h },
    href: `/images/fa2/${file}`,
    hexes,
  }
  await writeFile(join(OUT_DIR, `${slug}.json`), JSON.stringify(out))
  console.log(`[area-mosaic] ${slug}: ${hexes.length} hexes · frame ${fw}×${fh} (${(fw / fh).toFixed(3)})`)
}

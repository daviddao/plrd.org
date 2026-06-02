#!/usr/bin/env node
/**
 * Generate the hexagon-pixelation data for the Economies & Governance hero.
 *
 * The temple render (public/images/fa2/fa2-hero.png) is shown crisp; on hover a
 * cursor-following lens reveals a hexagon "pixelation" of the area underneath.
 * Every hex tile takes its colour from the underlying image pixels, and the
 * white background is cut out (near-white samples dropped) so the mosaic only
 * ever covers the building itself. This script samples the *whole* building
 * into seamless (slightly overlapping) tiles; the lens decides what shows.
 *
 * Output: src/data/fa2/hero-mosaic.json (committed to git). The site renders
 * it without ever needing sharp.
 *
 * sharp is intentionally NOT a project dependency. Install ad-hoc to regen:
 *   npm install --no-save sharp
 *   node scripts/generate-fa2-hero-mosaic.mjs
 */

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('\n[fa2-mosaic] sharp not installed. Run: npm install --no-save sharp\n')
  process.exit(1)
}
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'public/images/fa2/fa2-hero.png')
const OUT = join(ROOT, 'src/data/fa2/hero-mosaic.json')

const W = 820 // working/display canvas width (= viewBox width)

// Flat-top hexagon grid.
const SIZE = 20 // centre → vertex (= side length)
const DRAW = SIZE + 0.8 // draw slightly larger so tiles overlap — no white seams
const STEP_X = SIZE * 1.5
const STEP_Y = SIZE * Math.sqrt(3)

const isBg = (r, g, b) => r > 246 && g > 244 && b > 240

function smoothstep(t) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t * t * (3 - 2 * t)
}

function rand(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function hexPoints(cx, cy, size) {
  const pts = []
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k // flat-top: vertices at 0,60,120,...
    pts.push(`${(cx + size * Math.cos(a)).toFixed(1)},${(cy + size * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function sample(data, w, h, c, px, py, rad) {
  let R = 0, G = 0, B = 0, n = 0, bg = 0, tot = 0
  const x0 = Math.max(0, Math.floor(px - rad))
  const x1 = Math.min(w - 1, Math.floor(px + rad))
  const y0 = Math.max(0, Math.floor(py - rad))
  const y1 = Math.min(h - 1, Math.floor(py + rad))
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * c
      const r = data[i], g = data[i + 1], b = data[i + 2]
      tot++
      if (isBg(r, g, b)) { bg++; continue }
      R += r; G += g; B += b; n++
    }
  }
  if (n === 0) return null
  return { r: Math.round(R / n), g: Math.round(G / n), b: Math.round(B / n), coverage: n / tot }
}

const { data, info } = await sharp(SRC).resize(W).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

// Building bounds (non-white).
let minX = w, maxX = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * c
    if (!isBg(data[i], data[i + 1], data[i + 2])) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
    }
  }
}

const cols = Math.ceil(maxX / STEP_X) + 2
const rows = Math.ceil(h / STEP_Y) + 2

const hexes = []
for (let col = 0; col < cols; col++) {
  for (let row = 0; row < rows; row++) {
    const cx = col * STEP_X
    const cy = row * STEP_Y + (col % 2 ? STEP_Y / 2 : 0)
    if (cx < minX - SIZE || cx > maxX + SIZE) continue

    const s = sample(data, w, h, c, cx, cy, SIZE * 0.72)
    if (!s || s.coverage < 0.18) continue // mostly background → skip (cut out the building)

    hexes.push({ p: hexPoints(cx, cy, DRAW), f: `rgb(${s.r},${s.g},${s.b})` })
  }
}

const out = {
  viewBox: `0 0 ${w} ${h}`,
  width: w,
  height: h,
  image: { x: 0, y: 0, w, h },
  hexes,
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(out))
console.log(`[fa2-mosaic] ${hexes.length} hexes · building x${minX}-${maxX} · ${OUT}`)

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

// A pixel the exterior-white flood can pass through (true background + the
// anti-aliased halo around the silhouette). Building cream (~201,186,156) is
// far below this, so the flood stops at the building.
const passable = (r, g, b) => r >= 240 && g >= 238 && b >= 232

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

// Sample the average colour of foreground pixels (bg = exterior white).
function sample(data, bg, w, c, px, py, rad) {
  let R = 0, G = 0, B = 0, n = 0, tot = 0
  const x0 = Math.max(0, Math.floor(px - rad))
  const x1 = Math.min(w - 1, Math.floor(px + rad))
  const y0 = Math.max(0, Math.floor(py - rad))
  const y1 = Math.min(h - 1, Math.floor(py + rad))
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = y * w + x
      tot++
      if (bg[idx]) continue
      const i = idx * c
      R += data[i]; G += data[i + 1]; B += data[i + 2]; n++
    }
  }
  if (n === 0) return null
  return { r: Math.round(R / n), g: Math.round(G / n), b: Math.round(B / n), coverage: n / tot }
}

const { data, info } = await sharp(SRC).resize(W).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

// Exterior-white mask: flood-fill from every border pixel through passable
// (near-white) pixels. Anything not reached — including the building's own
// bright highlights enclosed inside the silhouette — stays foreground, so the
// mosaic has no holes over the building.
const bg = new Uint8Array(w * h)
const stack = []
const tryPush = (idx) => {
  if (bg[idx]) return
  const i = idx * c
  if (!passable(data[i], data[i + 1], data[i + 2])) return
  bg[idx] = 1
  stack.push(idx)
}
for (let x = 0; x < w; x++) { tryPush(x); tryPush((h - 1) * w + x) }
for (let y = 0; y < h; y++) { tryPush(y * w); tryPush(y * w + w - 1) }
while (stack.length) {
  const idx = stack.pop()
  const x = idx % w
  const y = (idx - x) / w
  if (x > 0) tryPush(idx - 1)
  if (x < w - 1) tryPush(idx + 1)
  if (y > 0) tryPush(idx - w)
  if (y < h - 1) tryPush(idx + w)
}

// Building bounds (foreground).
let minX = w, maxX = 0, minY = h, maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!bg[y * w + x]) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

// Tight display frame around the building (so the graphic has little dead
// white margin and the hover lens lands on the building almost everywhere).
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

    const s = sample(data, bg, w, c, cx, cy, SIZE * 0.62)
    if (!s || s.coverage < 0.12) continue // mostly background → skip (cut out the building)

    hexes.push({ p: hexPoints(cx, cy, DRAW), f: `rgb(${s.r},${s.g},${s.b})` })
  }
}

const out = {
  viewBox: `${fx} ${fy} ${fw} ${fh}`,
  frame: { x: fx, y: fy, w: fw, h: fh },
  image: { x: 0, y: 0, w, h },
  hexes,
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(out))
console.log(`[fa2-mosaic] ${hexes.length} hexes · building x${minX}-${maxX} y${minY}-${maxY} · frame ${fw}×${fh} (${(fw / fh).toFixed(3)}) · ${OUT}`)

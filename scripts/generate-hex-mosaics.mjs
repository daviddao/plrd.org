#!/usr/bin/env node
/**
 * Generate hexagonal "pixelation" mosaics for the four focus-area images.
 *
 * For each source image (e.g. public/images/fa2/digital-human-rights.jpg),
 * this script:
 *
 *   1. Loads the image via sharp and resizes it to a working canvas.
 *   2. Lays a flat-top hex grid over the canvas (every cell ≈ 36 px across).
 *   3. Samples the average colour from a small neighbourhood around each hex
 *      centre.
 *   4. Renders each hex as a discrete polygon in an SVG, with a soft "cloud"
 *      alpha falloff toward the edges so the mosaic dissolves into the page
 *      instead of ending in a hard hex outline.
 *   5. Writes the result to public/images/fa2/mosaics/<slug>.svg.
 *
 * sharp is intentionally NOT a project dependency — the build itself never
 * needs it, and pinning a native binary in pnpm-lock.yaml would slow down
 * every Vercel deploy. Install it ad-hoc the first time you regenerate:
 *
 *   npm install --no-save sharp
 *   node scripts/generate-hex-mosaics.mjs
 *
 * The output SVGs are committed to git so the site can render without
 * ever running sharp.
 */

let sharp
try {
  sharp = (await import("sharp")).default
} catch (err) {
  console.error(
    "\n[mosaic] sharp is not installed in this project.\n" +
      "        Install it locally (it is intentionally NOT a project\n" +
      "        dependency \u2014 the build doesn't need it):\n\n" +
      "          npm install --no-save sharp\n",
  )
  process.exit(1)
}
import { writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

// Source → output map. Each source is the focus-area hero image; we crop a
// "interesting" region (top-left bias) so the mosaic captures recognisable
// colour rather than averaging the whole canvas to mud.
const SOURCES = [
  {
    slug: "digital-human-rights",
    src: "public/images/fa2/digital-human-rights-hero.png",
  },
  {
    slug: "economies-governance",
    src: "public/images/fa2/fa2-hero.png",
  },
  {
    slug: "ai-robotics",
    src: "public/images/fa2/ai-robotics-hero.png",
  },
  {
    slug: "neurotech",
    src: "public/images/fa2/neurotech-hero.png",
  },
]

// ---------------------------------------------------------------------------
// Geometry: flat-top hex grid
// ---------------------------------------------------------------------------

/**
 * Layout:
 *
 *   - Hex "size" = distance from centre to a vertex (= side length for a
 *     regular hex). Width = 2*size, height = √3 * size.
 *   - Flat-top hexes pack with column step = 1.5*size and row step = √3*size,
 *     odd columns offset by √3/2 * size vertically.
 */
const HEX_SIZE = 22 // controls coarseness; smaller = more tiles
// Negative "gap" — each hex is drawn slightly larger than its grid cell so
// neighbouring tiles overlap. Without this, sub-pixel anti-aliasing leaves
// thin white seams between adjacent hexes. The overlap is invisible inside
// the cluster (each hex's stroke matches its own fill) but cleans up the
// seams completely.
const HEX_GAP = -1.5
// Hard ceiling on rows so the SVG stays a horizontal band above the card
// rather than a tall blob. Final SVG aspect ratio ≈ cols / MAX_ROWS.
const MAX_ROWS = 10

/** All 6 vertices for a flat-top hex centred at (cx, cy). */
function hexPoints(cx, cy, size) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i // 0, 60, 120, ...
    pts.push([cx + size * Math.cos(a), cy + size * Math.sin(a)])
  }
  return pts
}

// ---------------------------------------------------------------------------
// Cluster shape: soft "cloud" alpha falloff
// ---------------------------------------------------------------------------

/**
 * Returns 0..1 weight for a hex at (col, row) in a grid (cols × rows).
 * Anchor is biased toward the top so the mosaic appears to peek up over
 * the card from behind. We layer two radial falloffs (a "main blob"
 * top-centre and a smaller "satellite") plus a deterministic pseudo-noise
 * jitter to break the silhouette into something cloud-shaped instead of a
 * clean hex outline.
 */
function clusterAlpha(col, row, cols, rows, slug) {
  // Normalised coordinates 0..1
  const x = col / Math.max(1, cols - 1)
  const y = row / Math.max(1, rows - 1)

  // Main blob: roughly square silhouette so the cluster reads as a
  // "cloud" rather than a horizontal band, even though the SVG canvas
  // is wider than it is tall. The cluster sits slightly upper-left so
  // outlier tiles can scatter to the lower-right.
  const cx = slug === "neurotech" ? 0.45 : 0.38
  const cy = 0.45
  const dx = (x - cx) / 0.4
  const dy = (y - cy) / 0.55
  const main = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy))

  // Asymmetric satellite to the lower-right: pulls a few hexes out beyond
  // the main blob so the silhouette breaks out of an ellipse shape.
  const sx = (x - 0.7) / 0.22
  const sy = (y - 0.65) / 0.3
  const sat = 1 - Math.min(1, Math.sqrt(sx * sx + sy * sy))

  // Pseudo-random jitter, deterministic per cell — breaks the outline into
  // a soft cloud and (crucially) lets a few isolated tiles "float" away
  // from the main blob.
  const seed = (col * 73856093) ^ (row * 19349663) ^ slug.length
  const noise = ((Math.abs(Math.sin(seed)) * 43758.5453) % 1) * 0.34 - 0.1

  return Math.max(0, Math.min(1, Math.max(main, sat * 0.7) + noise))
}

// ---------------------------------------------------------------------------
// Colour sampling
// ---------------------------------------------------------------------------

/** Sample the average colour of an N×N pixel patch around (px, py). */
function samplePatch(pixels, w, h, channels, px, py, patch = 5) {
  const r = Math.max(1, Math.floor(patch / 2))
  let R = 0,
    G = 0,
    B = 0,
    n = 0
  const x0 = Math.max(0, Math.floor(px) - r)
  const x1 = Math.min(w - 1, Math.floor(px) + r)
  const y0 = Math.max(0, Math.floor(py) - r)
  const y1 = Math.min(h - 1, Math.floor(py) + r)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * channels
      R += pixels[i]
      G += pixels[i + 1]
      B += pixels[i + 2]
      n++
    }
  }
  if (n === 0) return [127, 127, 127]
  return [Math.round(R / n), Math.round(G / n), Math.round(B / n)]
}

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

function buildSvg(slug, pixels, w, h, channels) {
  const stepX = HEX_SIZE * 1.5
  const stepY = HEX_SIZE * Math.sqrt(3)
  const cols = Math.ceil(w / stepX) + 1
  const rows = Math.min(MAX_ROWS, Math.ceil(h / stepY) + 2)

  const innerSize = HEX_SIZE - HEX_GAP

  // Gather visible polygons + track bounding box so we can trim the SVG
  // viewBox tightly around the cluster (no dead space above/below).
  const polygons = []
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const cx = col * stepX
      const cy = row * stepY + (col % 2 === 1 ? stepY / 2 : 0)

      const alpha = clusterAlpha(col, row, cols, rows, slug)
      // Cutoff is aggressive enough to leave a clear "sky" around the
      // cluster, but the noise jitter above means a few tiles survive
      // beyond the main blob — those become the floating outliers.
      if (alpha < 0.22) continue

      // Sample colour from the source at this hex's centre
      const px = (cx / (cols * stepX)) * w
      const py = (cy / (rows * stepY)) * h
      const [r, g, b] = samplePatch(pixels, w, h, channels, px, py, 6)

      const pts = hexPoints(cx, cy, innerSize)
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ")

      // Map alpha-weight to actual fill-opacity. The cluster fades from
      // ~0.25 at the silhouette edge to ~0.95 at the centre, so the
      // brightest tiles read as crisp colour while the outliers feel
      // like they're dissolving into the page.
      const opacity = (0.25 + alpha * 0.7).toFixed(3)

      // No stroke — a stroke same colour as the fill still composites on
      // top of it, so the edge ends up darker than the interior. Instead
      // we close the AA seams by drawing each hex slightly larger than
      // its grid cell (HEX_GAP < 0 above), so neighbouring fills overlap.
      polygons.push(
        `<polygon points="${pts}" fill="rgb(${r},${g},${b})" fill-opacity="${opacity}" />`,
      )

      // Track tight bounding box (a hex extends ±innerSize horizontally
      // and ±innerSize*√3/2 vertically from its centre).
      const halfH = innerSize * (Math.sqrt(3) / 2)
      if (cx - innerSize < minX) minX = cx - innerSize
      if (cx + innerSize > maxX) maxX = cx + innerSize
      if (cy - halfH < minY) minY = cy - halfH
      if (cy + halfH > maxY) maxY = cy + halfH
    }
  }

  // Small pad so floating-point edges of the outermost hexes don't get
  // clipped by the viewBox.
  const PAD = 2
  const vbX = Math.floor(minX - PAD)
  const vbY = Math.floor(minY - PAD)
  const vbW = Math.ceil(maxX - minX + 2 * PAD)
  const vbH = Math.ceil(maxY - minY + 2 * PAD)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}">
${polygons.join("\n")}
</svg>`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function processOne({ slug, src }) {
  const inputPath = join(ROOT, src)
  console.log(`[mosaic] ${slug}: reading ${src}`)

  // Resize to a working canvas — small enough that sampling is cheap, large
  // enough that detail survives. We then attach the alpha cloud at SVG layer.
  const targetW = 600
  const { data, info } = await sharp(inputPath)
    .resize({ width: targetW, withoutEnlargement: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const svg = buildSvg(slug, data, info.width, info.height, info.channels)

  // Write SVG (committed; primary delivery format — it's tiny and crisp at
  // any zoom).
  const outDir = join(ROOT, "public/images/fa2/mosaics")
  await mkdir(outDir, { recursive: true })
  const svgPath = join(outDir, `${slug}.svg`)
  await writeFile(svgPath, svg, "utf8")
  console.log(`[mosaic] ${slug}: wrote ${svgPath} (${(svg.length / 1024).toFixed(1)} KB)`)
}

async function main() {
  for (const s of SOURCES) {
    await processOne(s)
  }
  console.log("[mosaic] done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

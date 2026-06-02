#!/usr/bin/env node
/**
 * Generate a tiny equirectangular world-land SVG path for the FA2 live
 * dashboard map (a dependency-free backdrop — no Leaflet/Mapbox).
 *
 * Fetches Natural Earth 1:110m land polygons (public domain), projects them
 * with a plate-carrée projection into a fixed viewBox, rounds coordinates, and
 * writes the single `<path d>` string to src/data/world-map.json (committed).
 *
 * The dashboard component plots the GainForest org sites on top using the same
 * projection: x = (lon+180)/360*W, y = (90-lat)/180*H.
 *
 * Run ad-hoc when you want to refresh the basemap:
 *   node scripts/generate-world-map.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/data/world-map.json')

const W = 1000
const H = 500
const SRC =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson'

const px = (lon) => +(((lon + 180) / 360) * W).toFixed(1)
const py = (lat) => +(((90 - lat) / 180) * H).toFixed(1)

function ringToPath(ring) {
  let d = ''
  ring.forEach(([lon, lat], i) => {
    d += `${i === 0 ? 'M' : 'L'}${px(lon)},${py(lat)}`
  })
  return d + 'Z'
}

function geomToPath(geom) {
  if (!geom) return ''
  if (geom.type === 'Polygon') return geom.coordinates.map(ringToPath).join('')
  if (geom.type === 'MultiPolygon')
    return geom.coordinates.map((poly) => poly.map(ringToPath).join('')).join('')
  return ''
}

const res = await fetch(SRC)
if (!res.ok) {
  console.error(`[world-map] fetch failed: ${res.status}`)
  process.exit(1)
}
const gj = await res.json()
let path = ''
for (const f of gj.features ?? []) path += geomToPath(f.geometry)

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify({ width: W, height: H, path }))
console.log(`[world-map] ${(path.length / 1024).toFixed(1)} KB path · ${OUT}`)

#!/usr/bin/env node
/**
 * Surgically patch specific section fields of org.plresearch.page records
 * on plresearch.org's PDS, sourcing values from data/atproto/pages/*.json.
 *
 *   node scripts/sync-pages.mjs              # apply default manifest below
 *   node scripts/sync-pages.mjs --dry-run    # show what would change, write nothing
 *
 * Why field-scoped (rather than whole-record replace): the seed JSONs in
 * data/atproto/pages/ have drifted from the live PDS records over time as
 * admins made out-of-band edits through /admin. A whole-record replace
 * would clobber those live-only edits (advisors lists, body copy, icon
 * choices) every time the seed file is used as a sync source. So this
 * script reads the live record, patches ONLY the fields named in the
 * manifest, bumps updatedAt, and writes back. Everything else is left as
 * the indexer has it.
 *
 * The manifest below is exactly the set of fields PR #4 (e440d23 "Sync
 * focus area descriptions") meant to update — the four focus-area hero
 * subtitles, the four approach-* subtitles on landing, and the
 * focus-areas body on /about/. Source of truth is the post-PR-4 seed
 * JSONs (with the F-1 typo fix applied).
 *
 * Env: ATPROTO_HANDLE + ATPROTO_PASSWORD (Bluesky app password for
 * plresearch.org). Loaded from .env / .env.local.
 */

import fs from "node:fs/promises"
import fsSync from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AtpAgent } from "@atproto/api"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

// Tiny .env loader — avoids a new npm dep. Existing process.env values are
// preserved unless override=true.
function loadEnvFile(p, override = false) {
  if (!fsSync.existsSync(p)) return
  for (const raw of fsSync.readFileSync(p, "utf8").split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq < 0) continue
    const k = line.slice(0, eq).trim()
    let v = line.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (override || process.env[k] === undefined) process.env[k] = v
  }
}
loadEnvFile(path.join(repoRoot, ".env"))
loadEnvFile(path.join(repoRoot, ".env.local"), true)

const PAGES_DIR = path.join(repoRoot, "data/atproto/pages")
const COLLECTION = "org.plresearch.page"

// -------------------------------------------------------------------------
// Manifest: which (rkey, sectionId, field) tuples to sync from disk.
// Each entry is [rkey, sectionId, field]. The value is read from the
// matching section in data/atproto/pages/<rkey>.json.
// -------------------------------------------------------------------------

const MANIFEST = [
  // Four focus-area pages — hero subtitles
  ["area-ai-robotics",          "hero", "subtitle"],
  ["area-digital-human-rights", "hero", "subtitle"],
  ["area-economies-governance", "hero", "subtitle"],
  ["area-neurotech",            "hero", "subtitle"],
  // Landing page — the four "approach-*" subtitles shown on the focus-area cards
  ["landing", "approach-dhr",   "subtitle"],
  ["landing", "approach-eg",    "subtitle"],
  ["landing", "approach-ai",    "subtitle"],
  ["landing", "approach-neuro", "subtitle"],
  // About page — the four-area summary block in the focus-areas section body
  ["about",   "focus-areas",    "body"],
]

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")

const handle = process.env.ATPROTO_HANDLE
const password = process.env.ATPROTO_PASSWORD
if (!handle || !password) {
  console.error("✗ ATPROTO_HANDLE + ATPROTO_PASSWORD must be set (see .env / .env.local)")
  process.exit(1)
}

const agent = new AtpAgent({ service: "https://bsky.social" })
await agent.login({ identifier: handle, password })
const did = agent.session.did
console.log(`✓ signed in as @${handle} (${did})${dryRun ? " · DRY RUN" : ""}\n`)

// Group manifest entries by rkey for one PDS round-trip per record.
const byRkey = new Map()
for (const [rkey, sectionId, field] of MANIFEST) {
  if (!byRkey.has(rkey)) byRkey.set(rkey, [])
  byRkey.get(rkey).push({ sectionId, field })
}

let pushed = 0
let skipped = 0
let failed = 0

for (const [rkey, patches] of byRkey) {
  const seedPath = path.join(PAGES_DIR, `${rkey}.json`)
  if (!fsSync.existsSync(seedPath)) {
    console.error(`  ✗ ${rkey}: seed file missing at ${seedPath}`)
    failed++
    continue
  }
  const seed = JSON.parse(await fs.readFile(seedPath, "utf8"))
  const seedSections = Object.fromEntries((seed.sections || []).map(s => [s.sectionId, s]))

  // Read live record. If it doesn't exist yet, fall back to the full seed.
  let live = null
  try {
    const res = await agent.com.atproto.repo.getRecord({ repo: did, collection: COLLECTION, rkey })
    live = res.data.value
  } catch (err) {
    if (err.error !== "RecordNotFound") {
      console.error(`  ✗ ${rkey}: getRecord failed: ${err.message || err}`)
      failed++
      continue
    }
  }
  if (!live) {
    console.log(`  ${dryRun ? "→" : "+"} ${rkey}: no live record yet, will create from seed`)
    if (!dryRun) {
      try {
        await agent.com.atproto.repo.putRecord({
          repo: did,
          collection: COLLECTION,
          rkey,
          record: { ...seed, $type: COLLECTION, pageId: rkey, updatedAt: new Date().toISOString() },
        })
        pushed++
      } catch (err) {
        console.error(`  ✗ ${rkey}: putRecord (create) failed: ${err.message || err}`)
        failed++
      }
    }
    continue
  }

  // Apply patches in-place onto a deep clone of the live record.
  const patched = JSON.parse(JSON.stringify(live))
  patched.sections = patched.sections || []
  const liveSections = Object.fromEntries(patched.sections.map((s, i) => [s.sectionId, i]))

  const changes = []
  for (const { sectionId, field } of patches) {
    const seedSection = seedSections[sectionId]
    if (!seedSection || seedSection[field] === undefined) {
      console.error(`  ✗ ${rkey}: seed has no .${sectionId}.${field} to copy from`)
      failed++
      continue
    }
    const newValue = seedSection[field]

    let idx = liveSections[sectionId]
    if (idx === undefined) {
      // Section doesn't exist live yet — append a new one.
      patched.sections.push({ sectionId, [field]: newValue })
      changes.push(`+${sectionId}.${field}`)
      continue
    }
    const oldValue = patched.sections[idx][field] ?? ""
    if (oldValue === newValue) continue
    patched.sections[idx][field] = newValue
    changes.push(`${sectionId}.${field}`)
  }

  if (changes.length === 0) {
    console.log(`  · ${rkey}: already in sync, skip`)
    skipped++
    continue
  }

  console.log(`  ${dryRun ? "→" : "✎"} ${rkey}: ${changes.join(", ")}`)
  if (dryRun) continue

  patched.$type = COLLECTION
  patched.pageId = rkey
  patched.updatedAt = new Date().toISOString()

  try {
    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTION,
      rkey,
      record: patched,
    })
    pushed++
  } catch (err) {
    console.error(`  ✗ ${rkey}: putRecord failed: ${err.message || err}`)
    failed++
  }
}

console.log(
  `\n${dryRun ? "would write" : "wrote"} ${pushed}, skipped ${skipped}, failed ${failed} ` +
  `· repo ${did} · collection ${COLLECTION}`
)
if (!dryRun && pushed > 0) {
  console.log("→ indexer picks up changes within ~60s. Static pages refresh on")
  console.log("  next ISR revalidation (60s) — or trigger immediately via the admin UI.")
}

process.exit(failed > 0 ? 1 : 0)

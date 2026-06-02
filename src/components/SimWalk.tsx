import type { RecentSim } from '@/lib/simocracy'

/**
 * "Most recent sims" — the 10 newest Simocracy sims walking from left to right.
 *
 * Each sim's 128×128 pipoya sprite sheet (4×4 of 32×32 frames; row order
 * front/left/right/back) drives a pure-CSS walk cycle on the "right" row, and
 * the whole row marches rightward as a seamless marquee (cards rendered twice).
 * codexPet / legacy sims with no sprite sheet fall back to their static avatar
 * thumbnail. Approach mirrors simocracy-v2's walking-sims canvas, reduced to
 * CSS for this static dashboard. See `RecentSim` in `@/lib/simocracy`.
 */
export default function SimWalk({ sims }: { sims: RecentSim[] }) {
  if (!sims || sims.length === 0) return null
  // Render twice so the -50% marquee translate loops seamlessly.
  const doubled = [...sims, ...sims]

  return (
    <div className="mt-12 pt-12 border-t border-gray-100">
      <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Most recent sims</h3>
      <div className="sim-parade-wall relative overflow-hidden">
        <div className="sim-parade inline-flex items-end gap-7">
          {doubled.map((sim, i) => (
            <SimWalker key={`${sim.did}-${i}`} sim={sim} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SimWalker({ sim }: { sim: RecentSim }) {
  const usesSheet = (sim.spriteKind ?? 'pipoya') === 'pipoya' && !!sim.spriteUrl

  return (
    <div className="flex w-20 shrink-0 flex-col items-center gap-2">
      <div className="flex h-16 items-end justify-center">
        {usesSheet ? (
          <span
            className="sim-sprite"
            style={{ backgroundImage: `url("${sim.spriteUrl}")` }}
            role="img"
            aria-label={sim.name}
          />
        ) : sim.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element — next/image optimization is off project-wide
          <img
            src={sim.imageUrl}
            alt={sim.name}
            loading="lazy"
            className="h-14 w-14 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-base font-medium text-gray-400">
            {sim.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="max-w-full truncate text-xs text-gray-600" title={sim.name}>
        {sim.name}
      </span>
    </div>
  )
}

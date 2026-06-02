import type { RecentSim } from '@/lib/simocracy'

/**
 * "Most recent sims" — the 10 newest Simocracy sims, standing in a row.
 *
 * Each sim's 128×128 pipoya sprite sheet (4×4 of 32×32 frames; row order
 * front/left/right/back) drives a pure-CSS idle on the FRONT row: the 4 frames
 * loop in place at ~8fps, so the sim bobs/idles facing the viewer without
 * moving — matching simocracy-v2's council `MiniPixelSim` (front-facing,
 * front-row loop). codexPet / legacy sims with no sprite sheet fall back to
 * their static avatar thumbnail, then an initial badge. See `RecentSim` in
 * `@/lib/simocracy`.
 */
export default function SimWalk({ sims }: { sims: RecentSim[] }) {
  if (!sims || sims.length === 0) return null

  return (
    <div className="mt-12 pt-12 border-t border-gray-100">
      <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Most recent sims</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-5">
        {sims.map((sim) => (
          <SimStander key={sim.did} sim={sim} />
        ))}
      </div>
    </div>
  )
}

function SimStander({ sim }: { sim: RecentSim }) {
  const usesSheet = (sim.spriteKind ?? 'pipoya') === 'pipoya' && !!sim.spriteUrl

  return (
    <div className="flex w-16 flex-col items-center gap-1.5">
      <div className="flex h-14 items-end justify-center">
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
            className="h-12 w-12 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-400">
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

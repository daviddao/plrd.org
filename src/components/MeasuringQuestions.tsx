'use client'

import { useEffect, useState } from 'react'
import { FIELD_COLOR, FIELD_INK, HAND_COLOR, ROLE_META, PL_ROLE_ORDER } from '@/lib/inflection-points'

function Badge({ letter, color, ink = '#ffffff' }: { letter: string; color: string; ink?: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
      style={{ backgroundColor: color, color: ink }}
    >
      {letter}
    </span>
  )
}

export default function MeasuringQuestions() {
  const [rolesOpen, setRolesOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* A — our hand (whole card opens the roles modal) */}
        <button
          type="button"
          onClick={() => setRolesOpen(true)}
          aria-haspopup="dialog"
          className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-300 hover:shadow-md"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <Badge letter="A" color={HAND_COLOR} />
            <h3 className="text-lg font-semibold tracking-tight text-black">Did PL&rsquo;s work make a difference?</h3>
          </div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
            Inputs · Activities · Outputs
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Which PL instruments were on the critical path, and would this have happened as fast, or
            at all, without us.
          </p>
          <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
            <span className="font-semibold" style={{ color: HAND_COLOR }}>Ours.</span> The axis we control with our partners.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-gray-400 transition-colors group-hover:text-blue">
            See the roles we play
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        {/* B — the field */}
        <FieldCard
          letter="B"
          title="Were the inflection points reached?"
          eyebrow="Outcomes"
          body="One pre-registered, externally observable threshold. A yes/no plus a date, measured the same way with or without PL."
          footRest="Advances with or without us."
        />

        {/* C — the field */}
        <FieldCard
          letter="C"
          title="Did reaching the inflection point matter?"
          eyebrow="Impact"
          body="A threshold that unlocks nothing is itself a finding. We name the second-order effects in advance and watch."
          footRest="The cascade the signal should trigger."
        />
      </div>

      {rolesOpen && <RolesModal onClose={() => setRolesOpen(false)} />}
    </>
  )
}

function FieldCard({
  letter,
  title,
  eyebrow,
  body,
  footRest,
}: {
  letter: string
  title: string
  eyebrow: string
  body: string
  footRest: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <Badge letter={letter} color={FIELD_COLOR} ink={FIELD_INK} />
        <h3 className="text-lg font-semibold tracking-tight text-black">{title}</h3>
      </div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: FIELD_COLOR }}>
        {eyebrow}
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{body}</p>
      <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <span className="font-semibold" style={{ color: FIELD_COLOR }}>The field.</span> {footRest}
      </p>
    </div>
  )
}

function RolesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="The roles we play"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div className="relative my-4 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: HAND_COLOR }}>
          Question A · Our hand
        </div>
        <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-black">
          Six roles, matched to the bottleneck each one releases
        </h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-600">
          Every card tags the roles PL played. Match the instrument to the bottleneck — a point can
          be reached with little PL involvement, which is still a win for the field, and we record
          our role honestly.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PL_ROLE_ORDER.map((r) => (
            <div key={r} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: HAND_COLOR }} />
                <span className="text-sm font-semibold text-black">{ROLE_META[r].label}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{ROLE_META[r].description}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-gray-400">
          Each role answers a different bottleneck. On a card, the tags under &ldquo;our hand&rdquo;
          tell you which ones PL brought to that specific inflection point.
        </p>
      </div>
    </div>
  )
}

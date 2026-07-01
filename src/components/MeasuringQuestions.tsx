import { FIELD_COLOR, HAND_COLOR } from '@/lib/inflection-points'

// Three questions, always visible. One is "our hand" (the only axis we control);
// two are "the field" (the change in the world, which moves with or without us).
const CARDS: {
  key: string
  color: string
  eyebrow: string
  title: string
  body: string
  footLead: string
  footRest: string
}[] = [
  {
    key: 'A',
    color: HAND_COLOR,
    eyebrow: 'Inputs · Activities · Outputs',
    title: 'Is our work making a difference?',
    body: 'Which PL instruments were on the critical path, and would this have happened as fast, or at all, without us.',
    footLead: 'Ours.',
    footRest: 'The only axis we control.',
  },
  {
    key: 'B',
    color: FIELD_COLOR,
    eyebrow: 'Outcomes',
    title: 'Did it happen?',
    body: 'One pre-registered, externally observable threshold. A yes/no plus a date, measured the same way with or without PL.',
    footLead: 'The field.',
    footRest: 'Advances with or without us.',
  },
  {
    key: 'C',
    color: FIELD_COLOR,
    eyebrow: 'Impact',
    title: 'Did it matter?',
    body: 'A threshold that unlocks nothing is itself a finding. We name the second-order effects in advance and watch.',
    footLead: 'The field.',
    footRest: 'The cascade the signal should trigger.',
  },
]

export default function MeasuringQuestions() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {CARDS.map((c) => (
        <div key={c.key} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.key}
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-black">{c.title}</h3>
          </div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: c.color }}>
            {c.eyebrow}
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{c.body}</p>
          <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
            <span className="font-semibold" style={{ color: c.color }}>{c.footLead}</span> {c.footRest}
          </p>
        </div>
      ))}
    </div>
  )
}

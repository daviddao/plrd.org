'use client'

import { useState } from 'react'
import { CONTRIBUTION_META, LOGIC_MODEL, type LogicStageKey } from '@/lib/inflection-points'

const QUESTIONS: {
  q: string
  title: string
  stages: LogicStageKey[]
  body: string
}[] = [
  {
    q: 'Q1',
    title: 'Did it happen?',
    stages: ['impact'],
    body: 'We pre-register one observable threshold and report a simple yes/no plus a date when it is reached. It is externally observable — measured the same way whether or not PL is involved.',
  },
  {
    q: 'Q2',
    title: 'Did it matter?',
    stages: ['outcomes'],
    body: 'A signal is only worth naming if it unlocks something. We name the second-order effects in advance and watch whether they follow. A threshold that is reached but unlocks nothing is itself a finding.',
  },
  {
    q: 'Q3',
    title: 'Did our work make it happen?',
    stages: ['inputs', 'activities', 'outputs'],
    body: 'We trace contribution rather than claim credit: which PL-funded teams, convenings, standards, or ventures were on the critical path — and reason honestly about the counterfactual: would this have happened as fast, or at all, without us?',
  },
]

export default function MeasuringQuestions() {
  const [active, setActive] = useState(0)
  const item = QUESTIONS[active]
  const stages = item.stages.map((k) => LOGIC_MODEL.find((s) => s.key === k)!)

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      {/* Vertical tabs */}
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="The three questions"
        className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-2 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {QUESTIONS.map((qq, i) => {
          const isActive = active === i
          return (
            <button
              key={qq.q}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all lg:w-full ${
                isActive
                  ? 'border-gray-200 bg-white shadow-sm'
                  : 'border-transparent hover:bg-white/60'
              }`}
            >
              <span
                className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: isActive ? '#1982F4' : '#9ca3af' }}
              >
                {qq.q}
              </span>
              <span
                className={`flex-1 whitespace-nowrap text-sm font-medium lg:whitespace-normal ${
                  isActive ? 'text-black' : 'text-gray-500'
                }`}
              >
                {qq.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 lg:p-8">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Maps to logic model: {stages.map((s) => s.label).join(' · ')}
        </div>
        <h3 className="mb-3 text-xl font-semibold tracking-tight text-black">{item.title}</h3>
        <p className="max-w-2xl text-base leading-relaxed text-gray-600">{item.body}</p>

        {/* Logic-model stage(s) this question covers — same row style as the cards */}
        <div className="mt-5 space-y-2.5 border-t border-gray-200 pt-5">
          {stages.map((s) => (
            <div key={s.key} className="flex gap-3">
              <span className="w-24 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {s.label}
              </span>
              <span className="flex-1 text-sm leading-relaxed text-gray-600">{s.body}</span>
            </div>
          ))}
        </div>

        {active === 2 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="mb-2 text-sm font-semibold text-black">
              PL&rsquo;s role on the critical path
            </div>
            <p className="mb-5 max-w-2xl text-sm leading-relaxed text-gray-600">
              Contribution sits on its own axis, separate from how far the field has moved — we never
              collapse the two into a single score. A point can be reached with little or no PL
              involvement; that is still a win for the field, and we record our role honestly. Each
              card tags PL&rsquo;s role as one of three:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.values(CONTRIBUTION_META).map((c) => (
                <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <span className="mb-2 inline-flex items-center rounded-full border border-dark-blue/20 bg-dark-blue/[0.06] px-2.5 py-1 text-xs font-medium text-dark-blue">
                    {c.label}
                  </span>
                  <p className="text-xs leading-relaxed text-gray-600">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

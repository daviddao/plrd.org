'use client'

import { useState } from 'react'

interface Track {
  partner: string
  type: string
}

interface Stage {
  number: string
  title: string
  amount: string
  desc: string
  retro: boolean
  tracks: Track[] | null
}

const stages: Stage[] = [
  {
    number: '01',
    title: 'Seed Grants',
    amount: '$5–10K',
    desc: 'Primitives & Research',
    retro: false,
    tracks: null,
  },
  {
    number: '02',
    title: 'Challenge Prizes',
    amount: '$10–50K',
    desc: 'Integration Milestones',
    retro: true,
    tracks: [
      { partner: 'PL × EF', type: 'Academic Research Paper' },
      { partner: 'PL × Octant', type: 'XYZ' },
      { partner: 'PL × NEAR', type: 'XYZ' },
      { partner: 'PL × [Partner]', type: 'XYZ' },
    ],
  },
  {
    number: '03',
    title: 'Pilot Funding',
    amount: '$50–150K',
    desc: 'Sovereign Deployments',
    retro: true,
    tracks: [
      { partner: 'PL × UNDP', type: 'Country Track' },
      { partner: 'PL × [Country]', type: 'Track' },
      { partner: 'PL × [Country]', type: 'Track' },
    ],
  },
  {
    number: '04',
    title: 'Blended Capital',
    amount: '$150K+',
    desc: 'Grow & Scale',
    retro: false,
    tracks: [
      { partner: 'PL Capital', type: 'Direct Investment' },
      { partner: 'PL × [VC Partner]', type: 'Track' },
    ],
  },
]

function PartnerLabel({ partner }: { partner: string }) {
  // Split on × to colorize the × symbol in blue
  const parts = partner.split('×')
  if (parts.length === 1) {
    return <span className="text-sm font-medium text-black">{partner}</span>
  }
  return (
    <span className="text-sm font-medium text-black">
      {parts[0]}
      <span className="text-blue">×</span>
      {parts.slice(1).join('×')}
    </span>
  )
}

export default function FundingPipeline() {
  const [open, setOpen] = useState<boolean[]>([false, false, false, false])
  const [hovered, setHovered] = useState<number | null>(null)

  function toggle(i: number) {
    setOpen((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  function isDotActive(i: number) {
    return open[i] || hovered === i
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
          FA2 · Economies &amp; Governance
        </p>
        <h2 className="font-serif text-3xl font-semibold leading-tight mb-3">
          The{' '}
          <em className="font-serif italic text-blue not-italic" style={{ fontStyle: 'italic' }}>
            Funding
          </em>{' '}
          Pipeline
        </h2>
        <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
          A staged capital architecture — from early-stage research primitives through sovereign
          deployments to blended investment at scale.
        </p>
      </div>

      {/* Flow line — lg+ only */}
      <div className="hidden lg:flex items-center mb-8 px-[12.5%]">
        {stages.map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div
              className={[
                'w-2.5 h-2.5 rounded-full border-[1.5px] border-blue transition-all duration-200 shrink-0',
                isDotActive(i)
                  ? 'bg-blue ring-4 ring-blue/10 scale-125'
                  : 'bg-white',
              ].join(' ')}
            />
            {/* Connector (not after last dot) */}
            {i < stages.length - 1 && (
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-blue/40 to-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Stage grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage, i) => {
          const isOpen = open[i]
          return (
            <div
              key={i}
              className="flex flex-col"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Stage header — clickable */}
              <button
                type="button"
                onClick={() => toggle(i)}
                className="text-left w-full group"
                aria-expanded={isOpen}
              >
                {/* Stage number */}
                <p className="text-xs text-gray-500 tracking-wide mb-1">{stage.number}</p>

                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-xl font-semibold leading-tight">{stage.title}</h3>
                  {stage.retro && (
                    <span className="shrink-0 text-[9px] uppercase tracking-widest border border-amber-600 text-amber-600 px-2 py-0.5 rounded-sm mt-0.5">
                      RetroPGF
                    </span>
                  )}
                </div>

                {/* Amount + desc */}
                <p className="text-sm font-medium text-blue mb-0.5">{stage.amount}</p>
                <p className="text-xs text-gray-500 mb-3">{stage.desc}</p>

                {/* Expand hint */}
                {stage.tracks && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-blue transition-colors">
                    <span>{isOpen ? 'Hide tracks' : 'Show tracks'}</span>
                    <svg
                      className={[
                        'w-3 h-3 transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                      ].join(' ')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </button>

              {/* Tracks — expandable */}
              {stage.tracks && (
                <div
                  className={[
                    'overflow-hidden transition-all duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  style={{ maxHeight: isOpen ? '600px' : '0px' }}
                >
                  <div className="mt-3 flex flex-col gap-2">
                    {stage.tracks.map((track, j) => (
                      <div
                        key={j}
                        className="bg-white border border-gray-100 border-l-2 border-l-transparent hover:border-l-blue hover:border-blue/30 hover:translate-x-1 transition-all p-4 rounded-lg"
                      >
                        <PartnerLabel partner={track.partner} />
                        <p className="text-xs text-gray-500 mt-0.5">{track.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footnote */}
      <div className="mt-10 border-t border-gray-100 pt-6">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Note</p>
        <p className="font-serif text-base italic text-gray-500">
          Stage amounts are indicative. Actual grant sizes depend on scope, partner co-funding, and
          available capital. RetroPGF stages are subject to retroactive evaluation criteria set by
          the respective partner.
        </p>
      </div>
    </div>
  )
}

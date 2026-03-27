'use client'

import Link from 'next/link'
import { AreaIcon } from '@/components/AreaIcons'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function LandingEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('landing')

  if (!ready || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-32 text-center text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <div
        className="relative pt-20 pb-20 md:pt-32 md:pb-28 lg:pt-44 lg:pb-36"
        style={{ clipPath: 'inset(0 -100vw 0 0)' }}
      >
        {/* Hero banner image - extends to screen edge */}
        <div
          className="absolute top-1/2 -translate-y-[60%] h-[140%] pointer-events-none select-none"
          style={{
            right: 'calc(-50vw + 50%)',
            width: '70vw',
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.35,
            maskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <h1 className="relative z-10 mb-8">
          <EditableField
            value={get('hero', 'title')}
            onChange={(v) => set('hero', 'title', v)}
            placeholder="Driving R&D breakthroughs to push humanity forward."
            className="font-serif text-[36px] md:text-[52px] lg:text-[64px] font-normal leading-[1.1] tracking-tight"
          />
        </h1>

        <div className="relative z-10 flex flex-wrap gap-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            About us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/areas"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
          >
            Focus areas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="relative z-10 mt-16 lg:mt-24">
          <svg
            className="w-6 h-6 text-gray-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>

      {/* R&D approach section */}
      <div className="pb-20 lg:pb-28 border-t border-gray-200 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <h2 className="mb-6">
              <EditableField
                value={get('approach', 'title')}
                onChange={(v) => set('approach', 'title', v)}
                placeholder="Use-inspired research across four frontiers"
                className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight"
              />
            </h2>
            <div className="mb-10">
              <EditableField
                value={get('approach', 'body')}
                onChange={(v) => set('approach', 'body', v)}
                multiline
                placeholder="We work in Pasteur's Quadrant — pursuing fundamental understanding while staying anchored to real-world impact."
                className="text-base text-gray-600 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex flex-col lg:sticky lg:top-24 gap-4">
            {/* Digital Human Rights */}
            <Link
              href="/areas/digital-human-rights"
              className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group"
            >
              <AreaIcon type="shield" />
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <EditableField
                    value={get('approach-dhr', 'title')}
                    onChange={(v) => set('approach-dhr', 'title', v)}
                    placeholder="Digital Human Rights"
                    className="text-sm font-medium text-black"
                  />
                </div>
                <EditableField
                  value={get('approach-dhr', 'subtitle')}
                  onChange={(v) => set('approach-dhr', 'subtitle', v)}
                  multiline
                  placeholder="Building decentralized infrastructure that enshrines freedom and safety in the digital age."
                  className="text-sm text-gray-500 leading-relaxed"
                />
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Economies & Governance */}
            <Link
              href="/areas/economies-governance"
              className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group"
            >
              <AreaIcon type="hexagon" />
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <EditableField
                    value={get('approach-eg', 'title')}
                    onChange={(v) => set('approach-eg', 'title', v)}
                    placeholder="Economies & Governance"
                    className="text-sm font-medium text-black"
                  />
                </div>
                <EditableField
                  value={get('approach-eg', 'subtitle')}
                  onChange={(v) => set('approach-eg', 'subtitle', v)}
                  multiline
                  placeholder="Crypto-native tools for more efficient, equitable coordination at global scale."
                  className="text-sm text-gray-500 leading-relaxed"
                />
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* AI & Robotics */}
            <Link
              href="/areas/ai-robotics"
              className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group"
            >
              <AreaIcon type="neural" />
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <EditableField
                    value={get('approach-ai', 'title')}
                    onChange={(v) => set('approach-ai', 'title', v)}
                    placeholder="AI & Robotics"
                    className="text-sm font-medium text-black"
                  />
                </div>
                <EditableField
                  value={get('approach-ai', 'subtitle')}
                  onChange={(v) => set('approach-ai', 'subtitle', v)}
                  multiline
                  placeholder="Responsible advancement in AGI, robotics, and immersive technologies that reshape how we interact with the world."
                  className="text-sm text-gray-500 leading-relaxed"
                />
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Neurotechnology */}
            <Link
              href="/areas/neurotech"
              className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg hover:border-blue hover:shadow-sm transition-all group"
            >
              <AreaIcon type="brain" />
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <EditableField
                    value={get('approach-neuro', 'title')}
                    onChange={(v) => set('approach-neuro', 'title', v)}
                    placeholder="Neurotechnology"
                    className="text-sm font-medium text-black"
                  />
                </div>
                <EditableField
                  value={get('approach-neuro', 'subtitle')}
                  onChange={(v) => set('approach-neuro', 'subtitle', v)}
                  multiline
                  placeholder="Accelerating brain-computer interfaces and NeuroAI to expand human cognition and treat brain disorders."
                  className="text-sm text-gray-500 leading-relaxed"
                />
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Team</h2>
        <div className="mb-6">
          <EditableField
            value={get('team', 'body')}
            onChange={(v) => set('team', 'body', v)}
            multiline
            placeholder="A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity."
            className="text-lg text-gray-700 leading-relaxed max-w-2xl"
          />
        </div>
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
        >
          Meet the team
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <EditBarSpacer />
      <EditBar
        isDirty={isDirty}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onSave={save}
        onDiscard={discard}
      />
    </div>
  )
}

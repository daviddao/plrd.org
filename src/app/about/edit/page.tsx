'use client'

import { usePageEdit, EditableField, EditBar, useRequireAdmin } from '@/components/InlineEdit'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export default function AboutEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } = usePageEdit('about')

  if (!ready || isLoading) return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: 'About', href: '/about' }, { label: 'Edit' }]} />
        <div className="relative pt-4 pb-16 lg:pt-8 lg:pb-20 overflow-hidden">
          {/* Background image - rotated hexagon clip */}
          <div
            className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[480px] md:h-[480px] lg:w-[580px] lg:h-[580px] pointer-events-none select-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <clipPath id="aboutHexClip">
                  <polygon points="200,40 330,110 330,290 200,360 70,290 70,110">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="45 200 200"
                      to="405 200 200"
                      dur="60s"
                      repeatCount="indefinite"
                    />
                  </polygon>
                </clipPath>
                <mask id="aboutHexFade">
                  <radialGradient id="aboutFadeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="50%" stopColor="white" />
                    <stop offset="100%" stopColor="black" />
                  </radialGradient>
                  <circle cx="200" cy="200" r="200" fill="url(#aboutFadeGrad)" />
                </mask>
              </defs>
              <image
                href="/images/banners/about-banner.jpg"
                x="0"
                y="0"
                width="400"
                height="400"
                preserveAspectRatio="xMaxYMid slice"
                clipPath="url(#aboutHexClip)"
                mask="url(#aboutHexFade)"
                opacity="0.35"
              />
            </svg>
          </div>

          <EditableField
            value={get('hero', 'title')}
            onChange={(v) => set('hero', 'title', v)}
            className="relative z-10 font-semibold text-[28px] md:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6 max-w-xl"
          />
          <EditableField
            value={get('hero', 'body') || get('hero', 'subtitle')}
            onChange={(v) => set('hero', 'body', v)}
            multiline
            className="relative z-10 text-gray-600 text-lg md:text-xl lg:text-[22px] leading-relaxed max-w-2xl mb-6"
          />
          <div className="relative z-10 flex flex-wrap gap-4">
            <Link
              href="/areas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
            >
              Focus areas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/authors"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
            >
              Meet the team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Focus Areas - static non-editable navigation cards */}
      <div className="max-w-6xl mx-auto px-6 mb-28">
        <h2 className="font-semibold text-xl lg:text-2xl mb-10">Our Four Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FocusCard
            slug="digital-human-rights"
            title="Digital Human Rights"
            description="Securing freedom and safety in the digital age through improved internet infrastructure and Web3 technologies."
          />
          <FocusCard
            slug="economies-governance"
            title="Economies & Governance"
            description="Upgrading coordination systems through cryptoeconomics, mechanism design, and public goods funding."
          />
          <FocusCard
            slug="ai-robotics"
            title="AI & Robotics"
            description="Advancing artificial intelligence and robotics with focus on beneficial outcomes and responsible development."
          />
          <FocusCard
            slug="neurotech"
            title="Neurotechnology"
            description="Pioneering brain-computer interfaces and related technologies to expand human capabilities safely."
          />
        </div>
      </div>

      {/* History */}
      <Section
        label="OUR HISTORY"
        title={get('history', 'title')}
        onTitleChange={(v) => set('history', 'title', v)}
      >
        <EditableField
          value={get('history', 'body')}
          onChange={(v) => set('history', 'body', v)}
          multiline
          className="text-base text-gray-700 leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">Paragraphs separated by blank lines</p>
      </Section>

      {/* Collaborations */}
      <Section
        label="COLLABORATIONS AND SUPPORT"
        title={get('collaborations', 'title')}
        onTitleChange={(v) => set('collaborations', 'title', v)}
      >
        <EditableField
          value={get('collaborations', 'body')}
          onChange={(v) => set('collaborations', 'body', v)}
          multiline
          className="text-base text-gray-700 leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">Paragraphs separated by blank lines</p>
      </Section>

      {/* Quote Juan */}
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <img className="mb-8 opacity-30 w-10" src="/images/about-page/quote-icon.svg" alt="" />
        <EditableField
          value={get('quote-juan', 'body') || get('quote-juan', 'title')}
          onChange={(v) => set('quote-juan', 'body', v)}
          className="font-semibold text-xl lg:text-2xl leading-relaxed mb-8"
        />
        <AuthorCard slug="juan-benet" />
      </div>

      {/* The Future */}
      <Section
        label="THE FUTURE"
        title={get('future', 'title')}
        onTitleChange={(v) => set('future', 'title', v)}
      >
        <EditableField
          value={get('future', 'body')}
          onChange={(v) => set('future', 'body', v)}
          multiline
          className="text-base text-gray-700 leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">Paragraphs separated by blank lines</p>
      </Section>

      {/* Will Scott quote */}
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="border-l-2 border-pink pl-8 py-3">
          <EditableField
            value={get('quote-will', 'body')}
            onChange={(v) => set('quote-will', 'body', v)}
            className="text-lg text-gray-700 leading-relaxed mb-5 italic"
          />
          <AuthorCard slug="will-scott" />
        </div>
      </div>

      <div className="pb-16" />
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

function Section({
  label,
  title,
  onTitleChange,
  children,
}: {
  label: string
  title: string
  onTitleChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 mb-28">
      <p className="text-pink text-sm tracking-wide mb-3">{label}</p>
      <EditableField
        value={title}
        onChange={onTitleChange}
        className="font-semibold text-xl lg:text-2xl leading-relaxed mb-8 max-w-3xl"
      />
      {children}
    </div>
  )
}

function FocusCard({ slug, title, description }: { slug: string; title: string; description: string }) {
  return (
    <Link href={`/areas/${slug}`} className="border border-gray-300 p-8 hover:border-blue hover:shadow-sm transition-all block">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-base text-gray-700">{description}</p>
    </Link>
  )
}

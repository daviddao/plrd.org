'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

const SLUG_TO_ICON: Record<string, AreaIconType> = {
  'ai-robotics': 'neural',
  'digital-human-rights': 'shield',
  'neurotech': 'brain',
}

const SLUG_TO_TITLE: Record<string, string> = {
  'ai-robotics': 'AI & Robotics',
  'digital-human-rights': 'Digital Human Rights',
  'neurotech': 'Neurotechnology',
}

export default function AreaEditPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : String(params.slug ?? '')

  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit(`area-${slug}`)

  if (!ready || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-32 text-center text-gray-400">
        Loading…
      </div>
    )
  }

  const iconType: AreaIconType = SLUG_TO_ICON[slug] ?? 'hexagon'
  const fallbackTitle = SLUG_TO_TITLE[slug] ?? slug

  // Read leads/advisors from the page record
  // usePageEdit exposes the full record indirectly through get()
  // but leads/advisors are top-level fields, not sections.
  // For now we show static leads from the known data.
  const KNOWN_LEADS: Record<string, string[]> = {
    'ai-robotics': ['molly-mackinlay'],
    'digital-human-rights': ['will-scott'],
    'neurotech': ['sean-escola'],
  }
  const KNOWN_ADVISORS: Record<string, string[]> = {
    'neurotech': ['adam-marblestone', 'david-markowitz', 'doris-tsao', 'edward-chang', 'greg-wayne', 'ilan-gur', 'matthew-botvinick', 'max-hodak'],
  }

  const leads = KNOWN_LEADS[slug] || []
  const advisors = KNOWN_ADVISORS[slug] || []

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Focus Areas', href: '/areas/' }, { label: fallbackTitle }, { label: 'Edit' }]} />

      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        <div className="flex items-start gap-5 mb-6">
          <AreaIcon type={iconType} className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 text-blue/70" />
          <div className="relative z-10 flex-1">
            <EditableField
              value={get('hero', 'title') || fallbackTitle}
              onChange={(v) => set('hero', 'title', v)}
              placeholder="Focus area title"
              className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight max-w-xl"
            />
          </div>
        </div>

        <div className="relative z-10 mb-8">
          <EditableField
            value={get('hero', 'subtitle')}
            onChange={(v) => set('hero', 'subtitle', v)}
            multiline
            placeholder="Short summary of this focus area"
            className="text-lg text-gray-600 leading-relaxed max-w-2xl"
          />
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 mb-10">
          <Link
            href={`/areas/${slug}/opportunity-spaces/`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            Opportunity Spaces
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Leads */}
        {leads.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-4">
            {leads.map((authorSlug) => (
              <AuthorCard key={authorSlug} slug={authorSlug} variant="lead" />
            ))}
          </div>
        )}
      </div>

      {/* Advisors */}
      {advisors.length > 0 && (
        <div className="relative z-10 mt-10 mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Advisors</h2>
          <div className="flex flex-wrap gap-3">
            {advisors.map((authorSlug) => (
              <AuthorCard key={authorSlug} slug={authorSlug} variant="advisor" />
            ))}
          </div>
        </div>
      )}

      {/* Content body */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Body content</p>
        <EditableField
          value={get('hero', 'body')}
          onChange={(v) => set('hero', 'body', v)}
          multiline
          placeholder="Main description of this focus area. Paragraphs separated by blank lines."
          className="text-base text-gray-700 leading-relaxed max-w-3xl"
        />
        <p className="text-xs text-gray-400 mt-2">Paragraphs separated by blank lines</p>
      </div>

      {/* Publications (static, non-editable) */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Publications</h2>
        <p className="text-sm text-gray-400">Publications are loaded from markdown files and cannot be edited here.</p>
        <Link href="/publications" className="text-sm text-blue hover:underline mt-4 inline-block">
          View all publications →
        </Link>
      </div>

      {/* Talks (static, non-editable) */}
      <div className="mb-10">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Talks</h2>
        <p className="text-sm text-gray-400">Talks are loaded from markdown files and cannot be edited here.</p>
        <Link href="/talks" className="text-sm text-blue hover:underline mt-4 inline-block">
          View all talks →
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

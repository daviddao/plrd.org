'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

const ICONS: Record<string, AreaIconType> = {
  'ai-robotics': 'neural',
  'digital-human-rights': 'shield',
  'neurotech': 'brain',
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

  const iconType: AreaIconType = ICONS[slug] ?? 'hexagon'

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/areas"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Focus Areas
        </Link>
      </div>

      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        <div className="flex items-start gap-5 mb-6">
          <AreaIcon type={iconType} className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 text-blue/70" />
          <div className="relative z-10 flex-1">
            <EditableField
              value={get('hero', 'title')}
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
            placeholder="Short summary of this focus area."
            className="text-lg text-gray-600 leading-relaxed max-w-2xl"
          />
        </div>

        <div className="relative z-10 mb-8">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Body</p>
          <EditableField
            value={get('hero', 'body')}
            onChange={(v) => set('hero', 'body', v)}
            multiline
            placeholder="Plain text, paragraphs separated by blank lines"
            className="text-base text-gray-700 leading-relaxed"
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

'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function ImpactEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('area-eg-impact')

  if (!ready || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-32 text-center text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Focus Areas', href: '/areas/' },
          { label: 'Economies & Governance', href: '/areas/economies-governance/' },
          { label: 'Impact', href: '/areas/economies-governance/impact/' },
          { label: 'Edit' },
        ]}
      />

      {/* Hero */}
      <div className="pt-8 pb-12 mb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Impact"
          className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-xl"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="Track ecosystem growth, measure outcomes, and explore the real-world impact of decentralized economies and governance."
          className="text-lg text-gray-600 leading-relaxed max-w-2xl"
        />
      </div>

      {/* Cards */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Cards</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <CardEdit
          sectionId="card-report-2025"
          label="Impact report"
          defaultTitle="Impact Report 2025"
          defaultBody="Annual report on ecosystem growth, key initiatives, and measurable outcomes."
          get={get}
          set={set}
        />
        <CardEdit
          sectionId="card-live-dashboard"
          label="Live dashboard"
          defaultTitle="Live Dashboard"
          defaultBody="Real-time metrics and data visualizations tracking ecosystem activity."
          get={get}
          set={set}
        />
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

function CardEdit({
  sectionId,
  label,
  defaultTitle,
  defaultBody,
  get,
  set,
}: {
  sectionId: string
  label: string
  defaultTitle: string
  defaultBody: string
  get: (s: string, f: 'title' | 'subtitle' | 'body' | 'label') => string
  set: (s: string, f: 'title' | 'subtitle' | 'body' | 'label', v: string) => void
}) {
  return (
    <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <EditableField
        value={get(sectionId, 'title')}
        onChange={(v) => set(sectionId, 'title', v)}
        placeholder={defaultTitle}
        className="text-lg font-medium text-black mb-2"
      />
      <EditableField
        value={get(sectionId, 'body')}
        onChange={(v) => set(sectionId, 'body', v)}
        multiline
        placeholder={defaultBody}
        className="text-base text-gray-500 leading-relaxed"
      />
    </div>
  )
}

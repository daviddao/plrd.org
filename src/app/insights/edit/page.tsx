'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function InsightsEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('insights')

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
          { label: 'Insights', href: '/insights/' },
          { label: 'Edit' },
        ]}
      />

      {/* Hero */}
      <div className="pt-8 pb-12 mb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Insights"
          className="text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-xl"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="Exploring the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity."
          className="text-lg text-gray-600 leading-relaxed max-w-2xl"
        />
      </div>

      {/* Cards */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Subpage cards</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardEdit
          sectionId="card-publications"
          defaultTitle="Publications"
          defaultBody="Papers and articles advancing the frontiers of decentralized systems, cryptography, and more."
          get={get}
          set={set}
        />
        <CardEdit
          sectionId="card-talks"
          defaultTitle="Talks"
          defaultBody="Presentations and lectures from conferences and events around the world."
          get={get}
          set={set}
        />
        <CardEdit
          sectionId="card-blog"
          defaultTitle="Blog"
          defaultBody="Updates, insights, and reflections from the PL R&D team."
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
  defaultTitle,
  defaultBody,
  get,
  set,
}: {
  sectionId: string
  defaultTitle: string
  defaultBody: string
  get: (s: string, f: 'title' | 'subtitle' | 'body' | 'label') => string
  set: (s: string, f: 'title' | 'subtitle' | 'body' | 'label', v: string) => void
}) {
  return (
    <div className="border border-gray-200 p-6 rounded-xl">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-mono">
        {sectionId}
      </p>
      <EditableField
        value={get(sectionId, 'title')}
        onChange={(v) => set(sectionId, 'title', v)}
        placeholder={defaultTitle}
        className="font-semibold text-lg mb-2"
      />
      <EditableField
        value={get(sectionId, 'body')}
        onChange={(v) => set(sectionId, 'body', v)}
        multiline
        placeholder={defaultBody}
        className="text-base text-gray-700 leading-relaxed"
      />
    </div>
  )
}

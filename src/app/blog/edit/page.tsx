'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function BlogEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('blog')

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
          { label: 'Blog', href: '/blog/' },
          { label: 'Edit' },
        ]}
      />

      <div className="pt-8 pb-12 mb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Blog"
          className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="Updates, insights, and reflections from the PL R&D team."
          className="text-base text-gray-600 leading-relaxed max-w-xl"
        />
      </div>

      <p className="text-sm text-gray-400">
        Blog posts are sourced from <code>content/blog/</code> and ATProto
        records. They are not editable from this screen.
      </p>

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

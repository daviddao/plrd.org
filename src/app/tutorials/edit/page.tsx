'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function TutorialsEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('tutorials')

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
          { label: 'Tutorials', href: '/tutorials/' },
          { label: 'Edit' },
        ]}
      />

      <div className="pt-8 pb-12 mb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Tutorials"
          className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="In-depth guides and educational materials on core research topics."
          className="text-base text-gray-600 leading-relaxed max-w-xl"
        />
      </div>

      <p className="text-sm text-gray-400">
        The tutorials list is generated from <code>content/tutorials/</code> and
        is not editable here.
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

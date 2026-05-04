'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

export default function CollaborationEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('collaborate')

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
        items={[{ label: 'Collaborate', href: '/outreach/collaboration/' }, { label: 'Edit' }]}
      />

      {/* Page header */}
      <div className="mt-6 mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Collaborate With Us"
          className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight max-w-lg mb-4"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="One or two sentences explaining what kinds of collaboration are welcome."
          className="text-gray-600 leading-relaxed max-w-xl"
        />
      </div>

      <hr className="border-gray-100 my-8" />

      {/* Body */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Body</p>
        <p className="text-xs text-gray-500 mb-3">
          Free-form paragraphs shown below the hero. Separate paragraphs with a blank line.
        </p>
        <EditableField
          value={get('body', 'body')}
          onChange={(v) => set('body', 'body', v)}
          multiline
          placeholder="Tell visitors how PL R&D collaborates and who we look for."
          className="text-sm text-gray-700 leading-relaxed max-w-3xl"
        />
      </div>

      <p className="text-xs text-gray-400 leading-relaxed italic max-w-xl">
        The “Contact us” button at the bottom of the live page is hard-coded
        (mailto:research@protocol.ai) and not editable here.
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

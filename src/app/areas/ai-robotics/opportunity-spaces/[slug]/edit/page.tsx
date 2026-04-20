'use client'

import { useCallback, useEffect, useState, use } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { EditBar, EditBarSpacer, EditableField, useRequireAdmin } from '@/components/InlineEdit'
import { opportunitySpaceRkey } from '@/lib/lexicons'
import type { OpportunitySpaceRecord } from '@/lib/lexicons'

type Props = { params: Promise<{ slug: string }> }

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function EditOpportunitySpacePage({ params }: Props) {
  const { slug } = use(params)
  const rkey = opportunitySpaceRkey('ai-robotics', slug)
  const { ready } = useRequireAdmin()

  const [original, setOriginal] = useState<OpportunitySpaceRecord | null>(null)
  const [record, setRecord] = useState<OpportunitySpaceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Fetch current record
  useEffect(() => {
    if (!ready) return
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/opportunity-spaces/${rkey}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as { rkey: string; record: OpportunitySpaceRecord }
        if (cancelled) return
        const rec: OpportunitySpaceRecord = {
          $type: 'org.plresearch.opportunitySpace',
          areaSlug: json.record.areaSlug,
          id: json.record.id,
          title: json.record.title ?? '',
          tagline: json.record.tagline ?? '',
          image: json.record.image ?? '',
          description: json.record.description ?? '',
          inflectionPoint: json.record.inflectionPoint ?? '',
          shift: json.record.shift ?? '',
          theOpportunity: json.record.theOpportunity ?? '',
          subfields: json.record.subfields ?? [],
          tippingSignals: json.record.tippingSignals ?? [],
          keyAssumptions: json.record.keyAssumptions ?? [],
          observations: json.record.observations ?? [],
          fieldSignals: json.record.fieldSignals ?? [],
          updatedAt: json.record.updatedAt,
        }
        setOriginal(rec)
        setRecord(structuredClone(rec))
      })
      .catch((err) => {
        console.error('[edit opspace] fetch error', err)
        if (!cancelled) setFetchError(String(err))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ready, rkey])

  const setField = useCallback(
    (field: keyof OpportunitySpaceRecord, value: string) => {
      setRecord((prev) => (prev ? { ...prev, [field]: value } : prev))
    },
    [],
  )

  const isDirty =
    record !== null &&
    original !== null &&
    JSON.stringify(record) !== JSON.stringify(original)

  const save = useCallback(async () => {
    if (!record) return
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/opportunity-spaces/${rkey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`HTTP ${res.status}: ${msg}`)
      }
      setOriginal(structuredClone(record))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('[edit opspace] save error', err)
      setSaveStatus('error')
    }
  }, [record, rkey])

  const discard = useCallback(() => {
    if (!original) return
    setRecord(structuredClone(original))
    setSaveStatus('idle')
  }, [original])

  if (!ready || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  if (fetchError || !record) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <Breadcrumb
          items={[
            { label: 'Areas', href: '/areas' },
            { label: 'AI & Robotics', href: '/areas/ai-robotics' },
            { label: 'Opportunity Spaces', href: '/areas/ai-robotics/opportunity-spaces' },
            { label: 'Edit' },
          ]}
        />
        <p className="mt-8 text-red-600">
          Failed to load opportunity space <code>{rkey}</code>: {fetchError ?? 'unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Areas', href: '/areas' },
          { label: 'AI & Robotics', href: '/areas/ai-robotics' },
          { label: 'Opportunity Spaces', href: '/areas/ai-robotics/opportunity-spaces' },
          { label: record.title || slug, href: `/areas/ai-robotics/opportunity-spaces/${slug}` },
          { label: 'Edit' },
        ]}
      />

      <div className="mt-12 mb-12 max-w-3xl">
        <EditableField
          value={record.title}
          onChange={(v) => setField('title', v)}
          className="text-2xl lg:text-[40px] font-semibold leading-[1.1] tracking-tight"
          placeholder="Opportunity space title"
        />
        <div className="mt-4">
          <EditableField
            value={record.tagline ?? ''}
            onChange={(v) => setField('tagline', v)}
            className="text-base text-gray-400"
            placeholder="Short tagline"
          />
        </div>
        <div className="mt-5">
          <EditableField
            value={record.description}
            onChange={(v) => setField('description', v)}
            className="text-lg text-gray-600 leading-relaxed"
            multiline
            placeholder="Description shown in the page hero"
          />
        </div>
      </div>

      <EditSection label="Inflection Point">
        <EditableField
          value={record.inflectionPoint ?? ''}
          onChange={(v) => setField('inflectionPoint', v)}
          className="text-base text-black leading-relaxed font-medium"
          multiline
          placeholder="What breakthrough unlocks this space?"
        />
      </EditSection>

      <EditSection label="Paradigm Shift">
        <EditableField
          value={record.shift ?? ''}
          onChange={(v) => setField('shift', v)}
          className="text-base text-gray-600 italic"
          multiline
          placeholder="What changes once the shift happens?"
        />
      </EditSection>

      <EditSection label="The Opportunity">
        <EditableField
          value={record.theOpportunity ?? ''}
          onChange={(v) => setField('theOpportunity', v)}
          className="text-base text-gray-700 leading-relaxed"
          multiline
          placeholder="What is the opportunity for PL?"
        />
      </EditSection>

      <div className="text-sm text-gray-400 mt-16">
        Editing <code>{rkey}</code> · Arrays (subfields, tipping signals, key assumptions, observations, field signals) are not editable here yet — use <code>/admin</code> or edit the record directly via ATProto.
      </div>

      <EditBar
        isDirty={isDirty}
        isSaving={saveStatus === 'saving'}
        saveStatus={saveStatus}
        onSave={save}
        onDiscard={discard}
      />
      <EditBarSpacer />
    </div>
  )
}

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 pb-12 border-b border-gray-100">
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-5">{label}</h2>
      <div className="max-w-3xl">{children}</div>
    </div>
  )
}

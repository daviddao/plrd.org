'use client'

import { useCallback, useEffect, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import EditHistoryByline from '@/components/EditHistoryByline'
import { EditBar, EditBarSpacer, EditableField, useRequireAdmin } from '@/components/InlineEdit'
import { ADMIN_DID, OPPORTUNITY_COLLECTION, opportunitySpaceRkey } from '@/lib/lexicons'
import type { OpportunitySpaceRecord } from '@/lib/lexicons'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type OpportunitySpaceEditorProps = {
  areaSlug: string
  /** Human-readable label for breadcrumb, e.g. "Digital Human Rights". */
  areaLabel: string
  /** URL slug of the space (maps to `id` on the record). */
  slug: string
}

/**
 * Shared inline editor for org.plresearch.opportunitySpace records.
 * Each area's /areas/<area>/opportunity-spaces/[slug]/edit route renders
 * this component with the appropriate areaSlug + areaLabel.
 */
export default function OpportunitySpaceEditor({
  areaSlug,
  areaLabel,
  slug,
}: OpportunitySpaceEditorProps) {
  const rkey = opportunitySpaceRkey(areaSlug, slug)
  const { ready } = useRequireAdmin()

  const [original, setOriginal] = useState<OpportunitySpaceRecord | null>(null)
  const [record, setRecord] = useState<OpportunitySpaceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

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

  const setStringArrayItem = useCallback(
    (field: 'subfields' | 'tippingSignals' | 'keyAssumptions' | 'observations', index: number, value: string) => {
      setRecord((prev) => {
        if (!prev) return prev
        const arr = [...(prev[field] ?? [])]
        arr[index] = value
        return { ...prev, [field]: arr }
      })
    },
    [],
  )

  const addStringArrayItem = useCallback(
    (field: 'subfields' | 'tippingSignals' | 'keyAssumptions' | 'observations') => {
      setRecord((prev) => {
        if (!prev) return prev
        const arr = [...(prev[field] ?? []), '']
        return { ...prev, [field]: arr }
      })
    },
    [],
  )

  const removeStringArrayItem = useCallback(
    (field: 'subfields' | 'tippingSignals' | 'keyAssumptions' | 'observations', index: number) => {
      setRecord((prev) => {
        if (!prev) return prev
        const arr = [...(prev[field] ?? [])]
        arr.splice(index, 1)
        return { ...prev, [field]: arr }
      })
    },
    [],
  )

  const setFieldSignalItem = useCallback(
    (index: number, key: 'kpi' | 'measurement', value: string) => {
      setRecord((prev) => {
        if (!prev) return prev
        const arr = [...(prev.fieldSignals ?? [])]
        arr[index] = { ...(arr[index] ?? { kpi: '', measurement: '' }), [key]: value }
        return { ...prev, fieldSignals: arr }
      })
    },
    [],
  )

  const addFieldSignal = useCallback(() => {
    setRecord((prev) => {
      if (!prev) return prev
      const arr = [...(prev.fieldSignals ?? []), { kpi: '', measurement: '' }]
      return { ...prev, fieldSignals: arr }
    })
  }, [])

  const removeFieldSignal = useCallback((index: number) => {
    setRecord((prev) => {
      if (!prev) return prev
      const arr = [...(prev.fieldSignals ?? [])]
      arr.splice(index, 1)
      return { ...prev, fieldSignals: arr }
    })
  }, [])

  const isDirty =
    record !== null &&
    original !== null &&
    JSON.stringify(record) !== JSON.stringify(original)

  const save = useCallback(async () => {
    if (!record) return
    setSaveStatus('saving')
    try {
      // Drop empty string entries from string arrays before saving.
      const cleaned: OpportunitySpaceRecord = {
        ...record,
        subfields: (record.subfields ?? []).filter((s) => s.trim() !== ''),
        tippingSignals: (record.tippingSignals ?? []).filter((s) => s.trim() !== ''),
        keyAssumptions: (record.keyAssumptions ?? []).filter((s) => s.trim() !== ''),
        observations: (record.observations ?? []).filter((s) => s.trim() !== ''),
        fieldSignals: (record.fieldSignals ?? []).filter(
          (s) => s.kpi.trim() !== '' || s.measurement.trim() !== '',
        ),
      }
      const res = await fetch(`/api/opportunity-spaces/${rkey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`HTTP ${res.status}: ${msg}`)
      }
      setOriginal(structuredClone(cleaned))
      setRecord(structuredClone(cleaned))
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

  const areaRoot = `/areas/${areaSlug}`
  const listRoot = `${areaRoot}/opportunity-spaces`
  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: 'Areas', href: '/areas' },
        { label: areaLabel, href: areaRoot },
        { label: 'Opportunity Spaces', href: listRoot },
        ...(record?.title
          ? [{ label: record.title, href: `${listRoot}/${slug}` }]
          : [{ label: slug, href: `${listRoot}/${slug}` }]),
        { label: 'Edit' },
      ]}
    />
  )

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
        {breadcrumb}
        <p className="mt-8 text-red-600">
          Failed to load opportunity space <code>{rkey}</code>: {fetchError ?? 'unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      {breadcrumb}
      <div className="mt-4">
        <EditHistoryByline
          targetUri={`at://${ADMIN_DID}/${OPPORTUNITY_COLLECTION}/${rkey}`}
        />
      </div>

      {/* Hero */}
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

      <EditSection label="Hero image">
        <EditableField
          value={record.image ?? ''}
          onChange={(v) => setField('image', v)}
          className="text-sm text-gray-600 font-mono"
          placeholder="https://… (paste any public image URL)"
        />
        <ImagePreview url={record.image ?? ''} />
      </EditSection>

      <EditSection label="Subfields">
        <StringArrayEditor
          items={record.subfields ?? []}
          onChange={(i, v) => setStringArrayItem('subfields', i, v)}
          onAdd={() => addStringArrayItem('subfields')}
          onRemove={(i) => removeStringArrayItem('subfields', i)}
          placeholder="e.g. Distributed Compute"
          itemClassName="text-sm"
        />
      </EditSection>

      <EditSection label="Inflection Point">
        <EditableField
          value={record.inflectionPoint ?? ''}
          onChange={(v) => setField('inflectionPoint', v)}
          className="text-base text-black leading-relaxed font-medium"
          multiline
          placeholder="What breakthrough unlocks this space?"
        />
        <div className="mt-8">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Tipping Signals</h3>
          <StringArrayEditor
            items={record.tippingSignals ?? []}
            onChange={(i, v) => setStringArrayItem('tippingSignals', i, v)}
            onAdd={() => addStringArrayItem('tippingSignals')}
            onRemove={(i) => removeStringArrayItem('tippingSignals', i)}
            placeholder="e.g. New markets for compute coordination emerge"
            itemClassName="text-sm text-gray-500"
          />
        </div>
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

      <div className="grid md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-100">
        <div>
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-5">Context</h2>
          <StringArrayEditor
            items={record.keyAssumptions ?? []}
            onChange={(i, v) => setStringArrayItem('keyAssumptions', i, v)}
            onAdd={() => addStringArrayItem('keyAssumptions')}
            onRemove={(i) => removeStringArrayItem('keyAssumptions', i)}
            placeholder="A key assumption (paragraph)"
            itemClassName="text-base text-gray-600 leading-relaxed"
            multiline
          />
        </div>
        <div>
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-5">Friction</h2>
          <StringArrayEditor
            items={record.observations ?? []}
            onChange={(i, v) => setStringArrayItem('observations', i, v)}
            onAdd={() => addStringArrayItem('observations')}
            onRemove={(i) => removeStringArrayItem('observations', i)}
            placeholder="An observation / obstacle (paragraph)"
            itemClassName="text-base text-gray-600 leading-relaxed"
            multiline
          />
        </div>
      </div>

      <EditSection label="Field Signals">
        <div className="grid md:grid-cols-2 gap-5">
          {(record.fieldSignals ?? []).map((signal, i) => (
            <div key={i} className="border-l-2 border-gray-100 pl-5 py-2 group relative">
              <EditableField
                value={signal.kpi}
                onChange={(v) => setFieldSignalItem(i, 'kpi', v)}
                className="text-base font-medium text-black"
                placeholder="KPI name"
              />
              <div className="mt-1">
                <EditableField
                  value={signal.measurement}
                  onChange={(v) => setFieldSignalItem(i, 'measurement', v)}
                  className="text-sm text-gray-400"
                  multiline
                  placeholder="How it's measured"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFieldSignal(i)}
                className="absolute top-2 right-2 text-xs text-gray-300 hover:text-red-500 transition-colors"
                title="Remove signal"
              >
                remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFieldSignal}
          className="mt-5 text-sm text-blue hover:underline"
        >
          + Add field signal
        </button>
      </EditSection>

      <div className="text-sm text-gray-400 mt-10">
        Editing <code>{rkey}</code> &middot; Changes write to
        <code> org.plresearch.opportunitySpace</code> on plresearch.org&rsquo;s PDS. Public pages
        revalidate within ~60s after save.
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

/**
 * Live preview for the hero image URL. Renders a thumbnail when the URL
 * resolves, fades to 30% opacity on an <img> load error so editors get
 * obvious feedback that the URL is broken without nuking the whole UI.
 */
function ImagePreview({ url }: { url: string }) {
  const trimmed = url.trim()
  if (!trimmed) {
    return (
      <p className="mt-3 text-xs text-gray-400">
        No image set. Any public HTTPS URL works (Unsplash, your CMS, an
        ATProto blob, &hellip;).
      </p>
    )
  }
  return (
    <div className="mt-3 w-60 h-32 bg-gray-100 rounded overflow-hidden border border-gray-200 relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trimmed}
        alt="hero preview"
        className="w-full h-full object-cover transition-opacity duration-200"
        onError={(e) => {
          const el = e.currentTarget
          el.style.opacity = '0.25'
          el.setAttribute('data-broken', 'true')
        }}
        onLoad={(e) => {
          const el = e.currentTarget
          el.style.opacity = '1'
          el.removeAttribute('data-broken')
        }}
      />
    </div>
  )
}

function StringArrayEditor({
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder,
  itemClassName = '',
  multiline = false,
}: {
  items: string[]
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder?: string
  itemClassName?: string
  multiline?: boolean
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="group flex items-start gap-2">
          <div className="flex-1">
            <EditableField
              value={item}
              onChange={(v) => onChange(i, v)}
              placeholder={placeholder}
              className={itemClassName}
              multiline={multiline}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="mt-1 text-xs text-gray-300 hover:text-red-500 transition-colors"
            title="Remove"
          >
            remove
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-sm text-blue hover:underline">
        + Add item
      </button>
    </div>
  )
}

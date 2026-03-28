'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/atproto'
import type { PageRecord, PageSection } from '@/lib/lexicons'

// ---------------------------------------------------------------------------
// useRequireAdmin
// ---------------------------------------------------------------------------

/**
 * Redirects to /admin if not authenticated + admin.
 * Returns { ready: true } only once authenticated + admin is confirmed.
 */
export function useRequireAdmin(): { ready: boolean } {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !isAdmin) {
      router.replace('/admin')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  const ready = !isLoading && isAuthenticated && isAdmin
  return { ready }
}

// ---------------------------------------------------------------------------
// usePageEdit
// ---------------------------------------------------------------------------

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type SectionField = keyof Omit<PageSection, 'sectionId'>

export interface UsePageEditResult {
  get: (sectionId: string, field: SectionField) => string
  set: (sectionId: string, field: SectionField, value: string) => void
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  saveStatus: SaveStatus
  save: () => Promise<void>
  discard: () => void
}

/**
 * Fetches GET /api/pages/:rkey, stores the PageRecord as state.
 * Provides get/set to read/write individual section fields.
 * save() PUTs the full updated PageRecord back.
 */
export function usePageEdit(rkey: string): UsePageEditResult {
  const [original, setOriginal] = useState<PageRecord | null>(null)
  const [record, setRecord] = useState<PageRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Fetch on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/pages/${rkey}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ rkey: string; record: PageRecord }>
      })
      .then(({ record }) => {
        if (cancelled) return
        setOriginal(record)
        setRecord(structuredClone(record))
      })
      .catch((err) => {
        console.error('[usePageEdit] fetch error', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [rkey])

  const get = useCallback(
    (sectionId: string, field: SectionField): string => {
      if (!record) return ''
      const section = record.sections.find((s) => s.sectionId === sectionId)
      return section?.[field] ?? ''
    },
    [record],
  )

  const set = useCallback(
    (sectionId: string, field: SectionField, value: string) => {
      setRecord((prev) => {
        if (!prev) return prev
        const sections = prev.sections.map((s) =>
          s.sectionId === sectionId ? { ...s, [field]: value } : s,
        )
        return { ...prev, sections }
      })
    },
    [],
  )

  const isDirty =
    record !== null &&
    original !== null &&
    JSON.stringify(record.sections) !== JSON.stringify(original.sections)

  const save = useCallback(async () => {
    if (!record) return
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/pages/${rkey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`HTTP ${res.status}: ${msg}`)
      }
      // Update original so isDirty resets
      setOriginal(structuredClone(record))
      setSaveStatus('saved')
      // Auto-reset to idle after 2 s
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('[usePageEdit] save error', err)
      setSaveStatus('error')
    }
  }, [record, rkey])

  const discard = useCallback(() => {
    if (!original) return
    setRecord(structuredClone(original))
    setSaveStatus('idle')
  }, [original])

  return {
    get,
    set,
    isDirty,
    isLoading,
    isSaving: saveStatus === 'saving',
    saveStatus,
    save,
    discard,
  }
}

// ---------------------------------------------------------------------------
// EditableField
// ---------------------------------------------------------------------------

/**
 * A transparent, auto-growing textarea that blends into surrounding text.
 * Pass all text-styling classes via `className`.
 */
export function EditableField({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = '',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-grow whenever value changes
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder={placeholder}
      rows={1}
      onKeyDown={
        multiline
          ? undefined
          : (e) => {
              if (e.key === 'Enter') e.preventDefault()
            }
      }
      className={[
        // Invisible base
        'bg-transparent resize-none outline-none overflow-hidden',
        // Hover / focus ring — visible enough to show it is editable
        'rounded-sm ring-1 ring-blue/10 hover:ring-blue/30 focus:ring-blue/50 focus:bg-blue/[0.03] transition-all px-1.5 -mx-1.5 py-0.5',
        // Block + full width so it fills the line
        'block w-full',
        // Cursor
        'cursor-text',
        // Caller text styling
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

// ---------------------------------------------------------------------------
// EditBar
// ---------------------------------------------------------------------------

/**
 * Fixed bottom bar that appears when isDirty or saveStatus !== "idle".
 * Shows a status indicator on the left and Save / Discard on the right.
 */
export function EditBar({
  isDirty,
  isSaving,
  saveStatus,
  onSave,
  onDiscard,
}: {
  isDirty: boolean
  isSaving: boolean
  saveStatus: string
  onSave: () => void
  onDiscard: () => void
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {saveStatus === 'saving' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span>Saving…</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-600">✓ Saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-600">Save failed — try again</span>
            </>
          )}
          {saveStatus === 'idle' && isDirty && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span>Unsaved changes</span>
            </>
          )}
          {saveStatus === 'idle' && !isDirty && (
            <span className="text-gray-400">Editing mode — click any text to edit</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isDirty && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="text-sm text-white bg-blue px-5 py-2 rounded-full hover:bg-blue/90 disabled:opacity-40 font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Spacer to prevent content from being hidden behind the fixed EditBar.
 * Place at the bottom of any page that uses EditBar.
 */
export function EditBarSpacer() {
  return <div className="pb-16" />
}

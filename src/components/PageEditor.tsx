"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import type { PageRecord, PageSection } from "@/lib/lexicons"

type PageEntry = { rkey: string; record: PageRecord }

// Human-readable labels for known rkeys
const PAGE_LABELS: Record<string, string> = {
  landing: "Landing",
  about: "About",
  areas: "Focus Areas",
  collaborate: "Collaborate",
  "area-ai-robotics": "AI & Robotics",
  "area-digital-human-rights": "Digital Human Rights",
  "area-neurotech": "Neurotechnology",
  "area-economies-governance": "Economies & Governance",
  "area-eg-subareas": "E&G — Subareas",
  "area-eg-impact": "E&G — Impact",
}

// Which fields are meaningful per sectionId prefix
function usedFields(section: PageSection): (keyof PageSection)[] {
  const id = section.sectionId
  const fields: (keyof PageSection)[] = []
  if (section.label !== undefined && section.label !== "") fields.push("label")
  if (section.title !== undefined || id === "hero") fields.push("title")
  if (section.subtitle !== undefined) fields.push("subtitle")
  if (section.body !== undefined || section.body === "") fields.push("body")
  // always show title + body; show others only if they have content
  const always: (keyof PageSection)[] = ["title", "body"]
  const extras: (keyof PageSection)[] = ["label", "subtitle"]
  return [...new Set([...always, ...extras.filter(f => fields.includes(f))])]
}

function FieldInput({
  label,
  value,
  onChange,
  multiline = false,
  mono = false,
  placeholder = "",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  mono?: boolean
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [value])

  const base =
    "w-full bg-transparent outline-none transition-colors text-sm text-gray-800 placeholder:text-gray-300"
  const borderClass = "border-b border-gray-200 focus:border-blue py-2"

  return (
    <div className="group">
      <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} ${borderClass} resize-none overflow-hidden leading-relaxed ${mono ? "font-mono text-[13px]" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} ${borderClass}`}
        />
      )}
    </div>
  )
}

function SectionCard({
  section,
  idx,
  onChange,
  isExpanded,
  onToggle,
}: {
  section: PageSection
  idx: number
  onChange: (idx: number, field: keyof PageSection, value: string) => void
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasContent = [section.title, section.subtitle, section.label, section.body].some(
    (v) => v && v.trim()
  )

  const preview = section.title || section.body?.slice(0, 60) || "(empty)"

  return (
    <div className={`border-b border-gray-100 last:border-b-0`}>
      {/* Section header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-left group hover:bg-gray-50/50 -mx-1 px-1 rounded transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-mono text-gray-300 shrink-0 w-5 text-right">
            {idx + 1}
          </span>
          <div className="min-w-0">
            <span className="text-xs font-medium text-gray-500 font-mono">
              {section.sectionId}
            </span>
            {!isExpanded && (
              <p className="text-sm text-gray-400 truncate mt-0.5 max-w-xs">
                {preview}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {hasContent && !isExpanded && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue/40" />
          )}
          <svg
            className={`w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-all ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded fields */}
      {isExpanded && (
        <div className="pb-5 pl-8 space-y-4">
          {/* Label — only show if has content or is a Section-type page */}
          {(section.label !== undefined) && (
            <FieldInput
              label="Label"
              value={section.label ?? ""}
              onChange={(v) => onChange(idx, "label", v)}
              placeholder="e.g. OUR HISTORY"
            />
          )}
          <FieldInput
            label="Title"
            value={section.title ?? ""}
            onChange={(v) => onChange(idx, "title", v)}
            placeholder="Section heading"
          />
          {(section.subtitle !== undefined || section.subtitle === "") && (
            <FieldInput
              label="Subtitle"
              value={section.subtitle ?? ""}
              onChange={(v) => onChange(idx, "subtitle", v)}
              placeholder="Short description"
            />
          )}

          {/* Body — write/preview tabs */}
          <BodyField
            value={section.body ?? ""}
            onChange={(v) => onChange(idx, "body", v)}
          />

          {/* Add missing optional fields */}
          <div className="flex gap-3 pt-1">
            {section.label === undefined && (
              <button
                type="button"
                onClick={() => onChange(idx, "label", "")}
                className="text-[11px] text-gray-400 hover:text-blue transition-colors"
              >
                + label
              </button>
            )}
            {section.subtitle === undefined && (
              <button
                type="button"
                onClick={() => onChange(idx, "subtitle", "")}
                className="text-[11px] text-gray-400 hover:text-blue transition-colors"
              >
                + subtitle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BodyField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current && !preview) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.max(textareaRef.current.scrollHeight, 80) + "px"
    }
  }, [value, preview])

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          Body
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`text-[11px] transition-colors ${!preview ? "text-gray-700 font-medium" : "text-gray-400 hover:text-gray-600"}`}
          >
            Write
          </button>
          <span className="text-gray-200 text-[10px]">|</span>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`text-[11px] transition-colors ${preview ? "text-gray-700 font-medium" : "text-gray-400 hover:text-gray-600"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {preview ? (
        <div className="min-h-[80px] py-2 border-b border-gray-200">
          {value.trim() ? (
            <div
              className="text-sm text-gray-700 leading-relaxed prose-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <p className="text-sm text-gray-300 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Supports markdown — **bold**, *italic*, [link](url)"
          rows={3}
          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300 border-b border-gray-200 focus:border-blue py-2 resize-none overflow-hidden leading-relaxed font-mono text-[13px] transition-colors"
        />
      )}
    </div>
  )
}

// Minimal markdown renderer
function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue underline">$1</a>')
      .replace(/\n/g, "<br/>")

  return md
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim()
      if (!block) return ""
      if (block.startsWith("### ")) return `<h3 class="font-semibold text-sm mt-3 mb-1">${inline(block.slice(4))}</h3>`
      if (block.startsWith("## ")) return `<h2 class="font-semibold text-base mt-4 mb-1">${inline(block.slice(3))}</h2>`
      if (block.startsWith("# ")) return `<h1 class="font-semibold text-lg mt-4 mb-2">${inline(block.slice(2))}</h1>`
      if (block.startsWith("```")) {
        const code = block.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
        return `<pre class="bg-gray-50 rounded p-2 text-xs overflow-x-auto"><code>${escape(code)}</code></pre>`
      }
      return `<p class="mb-2">${inline(block)}</p>`
    })
    .join("")
}

// ── Page list ─────────────────────────────────────────────────────────────────

function PageList({
  pages,
  onSelect,
}: {
  pages: PageEntry[]
  onSelect: (entry: PageEntry) => void
}) {
  return (
    <div className="divide-y divide-gray-100">
      {pages.map((entry) => {
        const label = PAGE_LABELS[entry.rkey] || entry.rkey
        const filled = entry.record.sections.filter(
          (s) => s.title || s.body || s.subtitle
        ).length
        const total = entry.record.sections.length

        return (
          <button
            key={entry.rkey}
            onClick={() => onSelect(entry)}
            className="w-full py-3 flex items-center justify-between text-left group hover:bg-gray-50/60 -mx-1 px-1 rounded transition-colors"
          >
            <div className="flex items-center gap-3">
              <div>
                <span className="text-sm text-gray-800 group-hover:text-blue transition-colors">
                  {label}
                </span>
                <span className="text-xs text-gray-400 font-mono ml-2">{entry.rkey}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {filled}/{total} sections
              </span>
              <svg
                className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PageEditor() {
  const [pages, setPages] = useState<PageEntry[]>([])
  const [selectedRkey, setSelectedRkey] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<PageRecord | null>(null)
  const [originalRecord, setOriginalRecord] = useState<PageRecord | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const searchParams = useSearchParams()
  const autoSelectRkey = searchParams.get("page")

  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((data) => {
        const loaded = data.pages || []
        setPages(loaded)
        setIsLoading(false)
        if (autoSelectRkey && !selectedRkey) {
          const entry = loaded.find((p: PageEntry) => p.rkey === autoSelectRkey)
          if (entry) openPage(entry)
        }
      })
      .catch(() => setIsLoading(false))
  }, [autoSelectRkey])

  const openPage = (entry: PageEntry) => {
    const clone = structuredClone(entry.record)
    setSelectedRkey(entry.rkey)
    setEditingRecord(clone)
    setOriginalRecord(structuredClone(entry.record))
    setExpandedSections(new Set())
    setMessage(null)
  }

  const handleBack = () => {
    setSelectedRkey(null)
    setEditingRecord(null)
    setOriginalRecord(null)
    setMessage(null)
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
      return next
    })
  }

  const updateSection = (idx: number, field: keyof PageSection, value: string) => {
    if (!editingRecord) return
    const sections = [...editingRecord.sections]
    sections[idx] = { ...sections[idx], [field]: value || undefined }
    setEditingRecord({ ...editingRecord, sections })
    setMessage(null)
  }

  const isDirty =
    editingRecord && originalRecord
      ? JSON.stringify(editingRecord) !== JSON.stringify(originalRecord)
      : false

  const handleSave = async () => {
    if (!selectedRkey || !editingRecord) return
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/pages/${selectedRkey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecord),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Save failed")
      }
      setMessage({ type: "success", text: "Saved" })
      setOriginalRecord(structuredClone(editingRecord))
      setPages((prev) =>
        prev.map((p) =>
          p.rkey === selectedRkey ? { rkey: selectedRkey, record: editingRecord } : p
        )
      )
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Save failed",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ── Loading ──

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-sm text-gray-400">Loading pages…</span>
      </div>
    )
  }

  if (pages.length === 0) {
    return <p className="text-sm text-gray-400">No pages found.</p>
  }

  // ── Section editor ──

  if (selectedRkey && editingRecord) {
    const label = PAGE_LABELS[selectedRkey] || selectedRkey

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-black transition-colors"
              title="Back to pages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-sm font-medium text-gray-800">{label}</h3>
              <p className="text-[11px] text-gray-400 font-mono">{selectedRkey}</p>
            </div>
          </div>

          {/* Save controls */}
          <div className="flex items-center gap-3">
            {message && (
              <span
                className={`text-xs transition-opacity ${
                  message.type === "success" ? "text-green-600" : "text-pink"
                }`}
              >
                {message.type === "success" ? "✓ " : "✗ "}
                {message.text}
              </span>
            )}
            {isDirty && !isSaving && !message && (
              <span className="text-[11px] text-gray-400">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="text-sm text-white bg-blue px-4 py-1.5 rounded-full hover:bg-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-100">
          {editingRecord.sections.map((section, idx) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              idx={idx}
              onChange={updateSection}
              isExpanded={expandedSections.has(section.sectionId)}
              onToggle={() => toggleSection(section.sectionId)}
            />
          ))}
        </div>

        {/* Bottom save */}
        {isDirty && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-sm text-white bg-blue px-5 py-2 rounded-full hover:bg-blue/90 disabled:opacity-40 transition-all font-medium"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Page list ──

  return <PageList pages={pages} onSelect={openPage} />
}

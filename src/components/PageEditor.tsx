"use client"

import { useState, useEffect } from "react"
import type { PageRecord, PageSection } from "@/lib/lexicons"

type PageEntry = { rkey: string; record: PageRecord }

export default function PageEditor() {
  const [pages, setPages] = useState<PageEntry[]>([])
  const [selectedRkey, setSelectedRkey] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<PageRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch all pages on mount
  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const selectPage = (entry: PageEntry) => {
    setSelectedRkey(entry.rkey)
    setEditingRecord(structuredClone(entry.record))
    setMessage(null)
  }

  const handleBack = () => {
    setSelectedRkey(null)
    setEditingRecord(null)
    setMessage(null)
  }

  const updateSection = (idx: number, field: keyof PageSection, value: string) => {
    if (!editingRecord) return
    const sections = [...editingRecord.sections]
    sections[idx] = { ...sections[idx], [field]: value || undefined }
    setEditingRecord({ ...editingRecord, sections })
  }

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
      setMessage({ type: "success", text: "Saved successfully" })
      // Update local list
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

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading pages...</p>
  }

  if (pages.length === 0) {
    return <p className="text-sm text-gray-400">No pages found.</p>
  }

  // Section editor view
  if (selectedRkey && editingRecord) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          ← Back to pages
        </button>

        <div className="mb-4">
          <span className="text-sm text-gray-500 uppercase tracking-wide">
            Editing:{" "}
          </span>
          <span className="text-sm font-mono text-gray-700">{selectedRkey}</span>
        </div>

        <div className="divide-y divide-gray-200 mb-6">
          {editingRecord.sections.map((section, idx) => (
            <div key={section.sectionId} className="py-5">
              {/* Section ID — read-only */}
              <div className="mb-3">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Section: {section.sectionId}
                </span>
              </div>

              {/* Label */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  value={section.label ?? ""}
                  onChange={(e) => updateSection(idx, "label", e.target.value)}
                  placeholder="(optional)"
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
                />
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={section.title ?? ""}
                  onChange={(e) => updateSection(idx, "title", e.target.value)}
                  placeholder="(optional)"
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={section.subtitle ?? ""}
                  onChange={(e) => updateSection(idx, "subtitle", e.target.value)}
                  placeholder="(optional)"
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Body (markdown)
                </label>
                <textarea
                  value={section.body ?? ""}
                  onChange={(e) => updateSection(idx, "body", e.target.value)}
                  placeholder="(optional)"
                  rows={4}
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors resize-y min-h-[100px] font-mono"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm text-blue hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-pink"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Page list view
  return (
    <div className="divide-y divide-gray-200">
      {pages.map((entry) => (
        <button
          key={entry.rkey}
          onClick={() => selectPage(entry)}
          className="w-full py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors -mx-1 px-1 rounded"
        >
          <div>
            <span className="text-sm text-black font-mono">{entry.rkey}</span>
            <span className="text-xs text-gray-400 ml-3">
              {entry.record.sections.length} section
              {entry.record.sections.length !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-xs text-gray-400">Edit →</span>
        </button>
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { markdownToHtml } from '@/lib/markdown'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  disabled?: boolean
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown...',
  minRows = 12,
  disabled = false,
}: Props) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`text-sm transition-colors ${!showPreview ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`text-sm transition-colors ${showPreview ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Preview
          </button>
        </div>
        <span className="text-xs text-gray-400">Markdown supported</span>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="p-4 min-h-[300px]">
          {value.trim() ? (
            <div className="markdown-content page-content prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
          ) : (
            <p className="text-gray-400 text-sm italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          disabled={disabled}
          className="w-full p-4 text-sm font-mono text-gray-700 bg-transparent border-none resize-y focus:outline-none"
          style={{ minHeight: `${minRows * 1.5}rem` }}
        />
      )}

      {/* Help text */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-400 font-mono">
          **bold** · _italic_ · [link](url) · `code` · # heading
        </span>
      </div>
    </div>
  )
}

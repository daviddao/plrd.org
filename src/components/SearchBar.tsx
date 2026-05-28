'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Fuse from 'fuse.js'

type SearchItem = {
  title: string
  summary: string
  date: string
  type: string
  relpermalink: string
}

const TYPE_META: Record<string, { label: string; icon: string }> = {
  publication: { label: 'Publication', icon: '📄' },
  talk: { label: 'Talk', icon: '🎤' },
  author: { label: 'Team', icon: '👤' },
  blog: { label: 'Blog', icon: '✏️' },
  tutorial: { label: 'Tutorial', icon: '📚' },
  area: { label: 'Focus Area', icon: '🔬' },
  page: { label: 'Page', icon: '→' },
}

function useSearch() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [searchError, setSearchError] = useState(false)
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)
  const loadedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadSearchIndex = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    try {
      const res = await fetch('/search-index.json')
      const data: SearchItem[] = await res.json()
      fuseRef.current = new Fuse(data, {
        shouldSort: true,
        ignoreLocation: true,
        threshold: 0.4,
        minMatchCharLength: 2,
        findAllMatches: true,
        keys: [
          { name: 'title', weight: 1 },
          { name: 'summary', weight: 0.5 },
        ],
      })
    } catch {
      setSearchError(true)
    }
  }, [])

  function openSearch() {
    setSearchOpen(true)
    loadSearchIndex()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
    setResults([])
  }

  function handleSearch(term: string) {
    setQuery(term)
    if (term.length < 2 || !fuseRef.current) {
      setResults([])
      return
    }
    const hits = fuseRef.current.search(term).slice(0, 8)
    setResults(hits.map((h) => h.item))
  }

  return { searchOpen, query, results, searchError, fuseRef, inputRef, containerRef, openSearch, closeSearch, handleSearch }
}

function SearchResults({ results, searchError, query, fuseLoaded, onSelect }: {
  results: SearchItem[]
  searchError: boolean
  query: string
  fuseLoaded: boolean
  onSelect: () => void
}) {
  if (results.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden max-h-[420px] overflow-y-auto">
        {results.map((item) => {
          const meta = TYPE_META[item.type] || { label: item.type, icon: '·' }
          return (
            <Link
              key={item.relpermalink}
              href={item.relpermalink}
              onClick={onSelect}
              className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm mt-0.5 w-5 text-center shrink-0 opacity-60">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black leading-snug truncate">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <span>{meta.label}</span>
                  {item.date && <span>· {new Date(item.date).getFullYear()}</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  if (query.length >= 2 && searchError) {
    return <p className="text-sm text-gray-400 mt-2 px-2">Search unavailable.</p>
  }

  if (query.length >= 2 && results.length === 0 && fuseLoaded) {
    return <p className="text-sm text-gray-400 mt-2 px-2">No results found.</p>
  }

  return null
}

export default function SearchBar({ variant }: { variant: 'desktop' | 'mobile' }) {
  const pathname = usePathname()
  const { searchOpen, query, results, searchError, fuseRef, inputRef, containerRef, openSearch, closeSearch, handleSearch } = useSearch()

  // Close on navigation
  useEffect(() => { closeSearch() }, [pathname])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch()
      if (e.key === '/' && !searchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  // Click outside to close (desktop)
  useEffect(() => {
    if (!searchOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={() => searchOpen ? closeSearch() : openSearch()}
          aria-label="Search"
          className="p-2 text-gray-500 hover:text-black rounded-full"
        >
          <SearchIcon />
        </button>
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 px-6 py-3 lg:hidden">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search pages, people, publications..."
              className="w-full text-sm bg-gray-50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue/20"
            />
            <div className="mt-2">
              <SearchResults results={results} searchError={searchError} query={query} fuseLoaded={!!fuseRef.current} onSelect={closeSearch} />
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop
  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className="flex items-center overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: searchOpen ? '288px' : '0px' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search pages, people, publications..."
          className="w-72 text-sm bg-gray-50 rounded-full px-4 py-2 pr-8 outline-none shrink-0"
          tabIndex={searchOpen ? 0 : -1}
        />
      </div>
      {searchOpen && (
        <button
          onClick={closeSearch}
          className="absolute right-0 p-2 text-gray-400 hover:text-black"
          aria-label="Close search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {!searchOpen && (
        <button
          onClick={openSearch}
          aria-label="Search"
          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          title="Press / to search"
        >
          <SearchIcon />
        </button>
      )}

      {searchOpen && (
        <div className="absolute right-0 top-full mt-2 w-96">
          <SearchResults results={results} searchError={searchError} query={query} fuseLoaded={!!fuseRef.current} onSelect={closeSearch} />
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

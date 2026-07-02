'use client'

import { useEffect, useState } from 'react'

/**
 * Subtle round dark-mode toggle.
 * Persists choice to localStorage; falls back to system preference.
 * The initial class is applied pre-paint by the inline script in layout.tsx
 * to avoid a flash of the wrong theme.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
    setIsDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={mounted ? isDark : undefined}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 transition-colors ${className}`}
    >
      {/* Sun (shown in dark mode → click to go light) */}
      <svg
        className={`h-[18px] w-[18px] ${mounted && isDark ? 'block' : 'hidden'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
        <path
          strokeLinecap="round"
          strokeWidth={1.5}
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      {/* Moon (shown in light mode → click to go dark) */}
      <svg
        className={`h-[17px] w-[17px] ${mounted && isDark ? 'hidden' : 'block'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    </button>
  )
}

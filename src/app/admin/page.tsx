'use client'

import { useAuth } from '@/lib/atproto'
import { useState } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import PageEditor from '@/components/PageEditor'

export default function AdminPage() {
  const { isAuthenticated, isAdmin, session, login, logout, isLoading } = useAuth()
  const [handle, setHandle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      await login(handle.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <Breadcrumb items={[{ label: 'Admin' }]} />
        <div className="relative pt-20 pb-16 overflow-hidden">
          <AdminGeo />
          <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight">
            Admin
          </h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <Breadcrumb items={[{ label: 'Admin' }]} />
        <div className="relative pt-20 pb-16 overflow-hidden">
          <AdminGeo />
          <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4">
            Connect
          </h1>
          <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
            Sign in with your Bluesky handle to access the admin panel.
          </p>
        </div>

        <form onSubmit={handleLogin} className="max-w-sm">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your-handle.bsky.social"
            disabled={isSubmitting}
            className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent transition-colors mb-4"
            autoFocus
          />
          {error && <p className="text-sm text-pink mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !handle.trim()}
            className="text-sm text-blue hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? 'Connecting...' : 'Connect with ATProto →'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Admin' }]} />
      <div className="relative pt-20 pb-16 overflow-hidden">
        <AdminGeo />
        <div className="relative z-10 flex items-center gap-4 mb-4">
          {session?.avatar && (
            <img src={session.avatar} alt={session.handle} className="w-14 h-14 rounded-full" />
          )}
          <div>
            <h1 className="text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight">
              {session?.displayName || session?.handle}
            </h1>
            <p className="text-gray-500 text-sm mt-1">@{session?.handle}</p>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="mb-12">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Identity</h2>
        <div className="divide-y divide-gray-200">
          <div className="py-3 flex items-baseline gap-4">
            <span className="text-sm text-gray-400 w-20 shrink-0">DID</span>
            <span className="text-sm text-gray-700 break-all">{session?.did}</span>
          </div>
          <div className="py-3 flex items-baseline gap-4">
            <span className="text-sm text-gray-400 w-20 shrink-0">Handle</span>
            <span className="text-sm text-gray-700">{session?.handle}</span>
          </div>
        </div>
      </div>

      {/* Page Content (admin only) */}
      {isAdmin && (
        <div className="mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Page Content</h2>
          <p className="text-sm text-gray-600 mb-6">
            Edit page content stored on ATProto.
          </p>
          <PageEditor />
        </div>
      )}

      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-black transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}

function AdminGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <rect x="450" y="120" width="140" height="180" rx="70" stroke="#C3E1FF" strokeWidth="0.75" />
      <rect x="480" y="200" width="80" height="100" rx="4" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="520" cy="240" r="12" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="520" y1="252" x2="520" y2="275" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="520" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="450" cy="210" r="2" fill="#C3E1FF" />
      <circle cx="590" cy="210" r="2" fill="#C3E1FF" />
      <circle cx="520" cy="300" r="3" fill="#C3E1CC" />
    </svg>
  )
}

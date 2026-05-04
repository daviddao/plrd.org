'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/atproto'

const EDIT_ROUTES: Record<string, string> = {
  landing: '/edit',
  about: '/about/edit',
  areas: '/areas/edit',
  collaborate: '/outreach/collaboration/edit',
  'area-ai-robotics': '/areas/ai-robotics/edit',
  'area-digital-human-rights': '/areas/digital-human-rights/edit',
  'area-neurotech': '/areas/neurotech/edit',
  'area-economies-governance': '/areas/economies-governance/edit',
  'area-eg-subareas': '/areas/economies-governance/subareas/edit',
  'area-eg-impact': '/areas/economies-governance/impact/edit',
  insights: '/insights/edit',
  publications: '/publications/edit',
  talks: '/talks/edit',
  tutorials: '/tutorials/edit',
  blog: '/blog/edit',
  authors: '/authors/edit',
}

/**
 * Edit button — only visible to admin users.
 * Positioned top-right of the page content area.
 * Links to the inline edit route for the given page rkey.
 *
 * If `href` is provided, it overrides the EDIT_ROUTES lookup — useful for
 * record collections other than `org.plresearch.page` (e.g. opportunity
 * spaces) that don't fit the rkey-based map.
 */
export default function EditPageButton({ rkey, href }: { rkey: string; href?: string }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated || !isAdmin) return null

  return (
    <Link
      href={href || EDIT_ROUTES[rkey] || `/admin?page=${encodeURIComponent(rkey)}`}
      className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-full shadow-lg hover:bg-blue/90 transition-colors text-sm font-medium"
      title={`Edit "${rkey}" page content`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit page
    </Link>
  )
}

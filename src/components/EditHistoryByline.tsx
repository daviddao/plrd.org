'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatDate } from '@/lib/format'
import { ADMIN_DID, OPPORTUNITY_COLLECTION, PAGE_COLLECTION } from '@/lib/lexicons'

type EditEvent = {
  uri?: string
  target: string
  editor: string
  editorHandle?: string | null
  changedFields?: string[] | null
  editedAt: string
  note?: string | null
}

type Profile = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

/**
 * Small inline byline for a content record: shows the latest editor + relative
 * time, plus a "View history (N)" control that opens a full-log drawer.
 *
 * Mounted on public detail pages and on edit pages. Fetches from
 * /api/edit-history?target=<at-uri> on mount. Swallows errors — if the indexer
 * is down, the byline just doesn't render.
 */
export default function EditHistoryByline({ targetUri }: { targetUri: string }) {
  const [events, setEvents] = useState<EditEvent[] | null>(null)
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/edit-history?target=${encodeURIComponent(targetUri)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data: { events: EditEvent[] }) => {
        if (!cancelled) setEvents(data.events ?? [])
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [targetUri])

  // Hydrate profiles (avatar/displayName) from public Bluesky API as events arrive.
  useEffect(() => {
    if (!events || events.length === 0) return
    const dids = Array.from(new Set(events.map((e) => e.editor))).filter(
      (d) => !profiles[d],
    )
    if (dids.length === 0) return
    Promise.all(
      dids.map((did) =>
        fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((p) =>
            p
              ? ({
                  did,
                  handle: p.handle,
                  displayName: p.displayName,
                  avatar: p.avatar,
                } as Profile)
              : null,
          )
          .catch(() => null),
      ),
    ).then((results) => {
      const next = { ...profiles }
      for (const p of results) {
        if (p) next[p.did] = p
      }
      setProfiles(next)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!events || events.length === 0) return null

  const latest = events[0]
  const latestProfile = profiles[latest.editor]

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        {latestProfile?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={latestProfile.avatar}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <span className="w-5 h-5 rounded-full bg-gray-200 inline-block" />
        )}
        <span>Last edited by</span>
        <HandleLink did={latest.editor} profile={latestProfile} fallback={latest.editorHandle} />
        <span>·</span>
        <RelativeTime iso={latest.editedAt} />
        <span>·</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-blue hover:underline"
        >
          View history ({events.length})
        </button>
      </div>

      {open && (
        <HistoryDrawer
          events={events}
          profiles={profiles}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

/** Convenience wrapper: byline for an org.plresearch.page record by rkey. */
export function PageEditHistoryByline({ rkey }: { rkey: string }) {
  return (
    <EditHistoryByline
      targetUri={`at://${ADMIN_DID}/${PAGE_COLLECTION}/${rkey}`}
    />
  )
}

/** Convenience wrapper: byline for an opportunity-space record by rkey. */
export function OpportunitySpaceEditHistoryByline({ rkey }: { rkey: string }) {
  return (
    <EditHistoryByline
      targetUri={`at://${ADMIN_DID}/${OPPORTUNITY_COLLECTION}/${rkey}`}
    />
  )
}

function HistoryDrawer({
  events,
  profiles,
  onClose,
}: {
  events: EditEvent[]
  profiles: Record<string, Profile>
  onClose: () => void
}) {
  // Lock body scroll while the drawer is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-500">Edit history</h2>
            <p className="text-xs text-gray-400 mt-0.5">{events.length} edits</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {events.map((e) => {
            const p = profiles[e.editor]
            const changed = (e.changedFields ?? []).filter(Boolean)
            return (
              <li key={e.uri ?? `${e.editor}-${e.editedAt}`} className="px-6 py-4 group">
                <div className="flex items-start gap-3">
                  {p?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-200 inline-block shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-sm">
                      <HandleLink did={e.editor} profile={p} fallback={e.editorHandle} />
                      <span className="text-gray-400">·</span>
                      <RelativeTime iso={e.editedAt} title={formatAbsolute(e.editedAt)} />
                    </div>
                    {changed.length > 0 ? (
                      <div className="mt-1.5 text-xs text-gray-500">
                        changed:{' '}
                        {changed.map((f, i) => (
                          <span key={f}>
                            <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">
                              {f}
                            </code>
                            {i < changed.length - 1 ? ' · ' : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400 italic">
                        No tracked field changes
                      </div>
                    )}
                    {e.note && (
                      <p className="mt-1.5 text-xs text-gray-600 italic">
                        &ldquo;{e.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100">
          Each entry is an <code>org.plresearch.editEvent</code> record on the editor&rsquo;s own
          ATProto PDS, indexed live. This page is the source of truth.
        </p>
      </div>
    </div>
  )
}

function HandleLink({
  did,
  profile,
  fallback,
}: {
  did: string
  profile?: Profile
  fallback?: string | null
}) {
  const handle = profile?.handle ?? fallback ?? did.slice(0, 20) + '…'
  const label = profile?.displayName ? `${profile.displayName}` : `@${handle}`
  return (
    <a
      href={`https://bsky.app/profile/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-black hover:text-blue underline-offset-2 hover:underline"
    >
      {label}
    </a>
  )
}

function RelativeTime({ iso, title }: { iso: string; title?: string }) {
  const [label, setLabel] = useState<string>(() => relative(iso))
  useEffect(() => {
    const interval = setInterval(() => setLabel(relative(iso)), 60_000)
    return () => clearInterval(interval)
  }, [iso])
  return (
    <time
      dateTime={iso}
      title={title ?? formatAbsolute(iso)}
      className="text-gray-500"
    >
      {label}
    </time>
  )
}

function relative(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return formatDate(iso)
}

function formatAbsolute(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

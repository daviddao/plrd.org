'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatDate } from '@/lib/format'
import type {
  ActivityBucket,
  BlueskyProfile,
  SimLeaderboardEntry,
  SimocracyEvent,
  SimocracyTotals,
  UserLeaderboardEntry,
} from '@/lib/simocracy'

type Props = {
  totals: SimocracyTotals
  pulse14d: ActivityBucket[]
  topSims: SimLeaderboardEntry[]
  topUsers: UserLeaderboardEntry[]
  recentEvents: SimocracyEvent[]
  profiles: Record<string, BlueskyProfile>
  fetchedAt: string
  degraded: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff) || diff < 0) return ''
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return formatDate(iso)
}

function truncateDid(did: string): string {
  return did.length <= 20 ? did : `${did.slice(0, 12)}…${did.slice(-6)}`
}

function hashHue(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

// Animates a number from 0 → target with ease-out cubic.
function useCountUp(target: number, duration = 800): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (target <= 0) {
      setV(0)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setV(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

type TileProps = {
  label: string
  value: number
  caption: string
  format?: (n: number) => string
  accent?: 'blue' | 'pink' | 'teal' | 'black'
}

function StatTile({ label, value, caption, format = formatCount, accent = 'black' }: TileProps) {
  const animated = useCountUp(value)
  const accentClass = {
    blue: 'text-blue',
    pink: 'text-pink',
    teal: 'text-teal',
    black: 'text-black',
  }[accent]
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-xl hover:border-blue/30 hover:shadow-sm transition-all">
      <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-medium">
        {label}
      </div>
      <div
        className={`mt-2 text-3xl lg:text-4xl font-semibold leading-none tabular-nums ${accentClass}`}
      >
        {format(animated)}
      </div>
      <div className="mt-2 text-sm text-gray-500 leading-snug">{caption}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

function Sparkline({ buckets }: { buckets: ActivityBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0)
  const max = Math.max(1, ...buckets.map((b) => b.count))
  const w = 280
  const h = 60
  const stepX = buckets.length > 1 ? w / (buckets.length - 1) : 0
  const points = buckets.map((b, i) => {
    const x = i * stepX
    const y = h - (b.count / max) * (h - 6) - 3
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = `M ${points.join(' L ')}`
  const area = `${line} L ${w},${h} L 0,${h} Z`

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-medium">
            14-day pulse
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-semibold text-black tabular-nums">{total}</span> events in the
            last fortnight
          </div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-16"
        aria-label="14-day activity sparkline"
      >
        <path d={area} fill="var(--color-blue, #1982F4)" fillOpacity="0.08" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-blue, #1982F4)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {buckets.map((b, i) =>
          b.count > 0 ? (
            <circle
              key={i}
              cx={i * stepX}
              cy={h - (b.count / max) * (h - 6) - 3}
              r="2"
              fill="var(--color-blue, #1982F4)"
            />
          ) : null,
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-gray-400">
        <span>{buckets[0]?.date}</span>
        <span>{buckets[buckets.length - 1]?.date}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function SimocracyDashboard({
  totals,
  pulse14d,
  topSims,
  topUsers,
  recentEvents,
  profiles,
  fetchedAt,
  degraded,
}: Props) {
  const [tab, setTab] = useState<'sims' | 'users' | 'activity'>('sims')

  const fetchedLabel = useMemo(() => {
    try {
      return new Date(fetchedAt).toLocaleString()
    } catch {
      return fetchedAt
    }
  }, [fetchedAt])

  if (degraded) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-100 rounded-xl text-center">
        <p className="text-sm text-gray-600">
          The Simocracy indexer is currently unreachable. Try refreshing in a minute.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Headline tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile
          label="Treasury governed"
          value={totals.treasuryUsd}
          caption="Sum of gathering treasuries + the FtC SF tower."
          format={formatUsd}
          accent="blue"
        />
        <StatTile
          label="Voices"
          value={totals.uniqueHumans}
          caption="Unique humans active on Simocracy."
          accent="pink"
        />
        <StatTile
          label="Sims"
          value={totals.totalSims}
          caption="AI agents minted to debate and deliberate."
        />
        <StatTile
          label="Gatherings"
          value={totals.totalGatherings}
          caption="Events, hackathons, and councils convened."
        />
        <StatTile
          label="S-Processes"
          value={totals.totalSProcesses}
          caption="Multi-agent deliberations completed."
          accent="teal"
        />
        <StatTile
          label="Chats"
          value={totals.totalChats}
          caption="Messages exchanged with sims."
        />
      </section>

      {/* Pulse */}
      <Sparkline buckets={pulse14d} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-50 border border-gray-100 rounded-full w-fit">
        {(
          [
            { key: 'sims', label: 'Top sims' },
            { key: 'users', label: 'Top humans' },
            { key: 'activity', label: 'Recent activity' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              tab === t.key
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sims' && <SimsList sims={topSims} />}
      {tab === 'users' && <UsersList users={topUsers} profiles={profiles} />}
      {tab === 'activity' && <ActivityList events={recentEvents} profiles={profiles} />}

      <p className="text-xs text-gray-400">
        Live data from{' '}
        <a
          href="https://simocracy.org/stats"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          simocracy.org
        </a>{' '}
        · last refreshed {fetchedLabel} · cached for 60s.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-lists
// ---------------------------------------------------------------------------

function SimsList({ sims }: { sims: SimLeaderboardEntry[] }) {
  if (sims.length === 0) {
    return <EmptyCard>No chat data yet.</EmptyCard>
  }
  return (
    <ol className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl overflow-hidden">
      {sims.map((sim, i) => (
        <li key={sim.name} className="flex items-center gap-4 px-5 py-3">
          <span className="w-6 text-right text-xs tabular-nums text-gray-400 font-mono">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: `oklch(0.6 0.13 ${hashHue(sim.name)})` }}
            aria-hidden
          >
            {sim.name.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 text-sm text-black truncate">{sim.name}</span>
          <span className="text-xs tabular-nums uppercase tracking-[0.12em] text-gray-400">
            {sim.chats} {sim.chats === 1 ? 'msg' : 'msgs'}
          </span>
        </li>
      ))}
    </ol>
  )
}

function UsersList({
  users,
  profiles,
}: {
  users: UserLeaderboardEntry[]
  profiles: Record<string, BlueskyProfile>
}) {
  if (users.length === 0) {
    return <EmptyCard>No user activity yet.</EmptyCard>
  }
  return (
    <ol className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl overflow-hidden">
      {users.map((u, i) => {
        const p = profiles[u.did]
        const label = p?.displayName ?? (p?.handle ? `@${p.handle}` : truncateDid(u.did))
        return (
          <li key={u.did} className="flex items-center gap-4 px-5 py-3">
            <span className="w-6 text-right text-xs tabular-nums text-gray-400 font-mono">
              {String(i + 1).padStart(2, '0')}
            </span>
            <UserAvatar profile={p} did={u.did} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-black truncate">{label}</div>
              {p?.displayName && p.handle && (
                <div className="text-xs text-gray-400 truncate font-mono">@{p.handle}</div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs tabular-nums uppercase tracking-[0.12em] text-gray-400 shrink-0">
              {u.chats > 0 && <span>💬 {u.chats}</span>}
              <span className="font-medium text-blue">{u.total} total</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function ActivityList({
  events,
  profiles,
}: {
  events: SimocracyEvent[]
  profiles: Record<string, BlueskyProfile>
}) {
  if (events.length === 0) {
    return <EmptyCard>No activity yet.</EmptyCard>
  }
  return (
    <ul className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl overflow-hidden">
      {events.map((e, i) => {
        const p = profiles[e.actorDid]
        const who = p?.displayName ?? (p?.handle ? `@${p.handle}` : truncateDid(e.actorDid))
        const sim = e.simNames[0]
        return (
          <li key={i} className="flex items-start gap-3 px-5 py-3">
            <UserAvatar profile={p} did={e.actorDid} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-black leading-snug">
                <span className="font-medium">{who}</span>
                {e.type === 'chat' ? (
                  <>
                    <span className="text-gray-500"> chatted with </span>
                    <span className="font-medium">{sim}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500"> ran an S-Process</span>
                    {e.proposalTitle && (
                      <>
                        <span className="text-gray-500"> on </span>
                        <span className="italic">&ldquo;{e.proposalTitle}&rdquo;</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
              {timeAgo(e.createdAt)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function UserAvatar({
  profile,
  did,
}: {
  profile?: BlueskyProfile
  did: string
}) {
  if (profile?.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar}
        alt=""
        className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
      />
    )
  }
  const initial = (profile?.handle ?? did).charAt(0).toUpperCase()
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: `oklch(0.6 0.13 ${hashHue(did)})` }}
      aria-hidden
    >
      {initial}
    </span>
  )
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 bg-white border border-gray-100 rounded-xl text-center text-sm text-gray-500">
      {children}
    </div>
  )
}

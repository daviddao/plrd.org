'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/atproto'
import { formatDate } from '@/lib/format'

const MAX_COMMENT_LENGTH = 2000

type CommentAuthor = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

type Comment = {
  uri: string
  rkey: string
  record: {
    subject: string
    text: string
    author: CommentAuthor
    createdAt: string
  }
}

function initials(author: CommentAuthor): string {
  const source = author.displayName || author.handle || '?'
  return source.trim().charAt(0).toUpperCase()
}

function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment
  canDelete: boolean
  onDelete: (rkey: string) => void
}) {
  const { author, text, createdAt } = comment.record
  return (
    <li className="flex gap-3 py-4 border-b border-gray-100 last:border-b-0">
      {author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.avatar}
          alt=""
          className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
          {initials(author)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <a
            href={`https://bsky.app/profile/${author.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            {author.displayName || author.handle}
          </a>
          <span className="text-xs text-gray-400">@{author.handle}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.rkey)}
              className="text-xs text-gray-400 hover:text-red-600 ml-auto"
            >
              Delete
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </li>
  )
}

export default function Comments({ subject }: { subject: string }) {
  const { session, isAuthenticated, isAdmin, login, logout } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [handle, setHandle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?subject=${encodeURIComponent(subject)}`,
      )
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch {
      // Non-fatal — just show an empty thread.
    } finally {
      setLoading(false)
    }
  }, [subject])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const body = text.trim()
    if (!body) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, text: body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to post comment')
      setComments((prev) => [...prev, data.comment])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (rkey: string) => {
    if (!confirm('Delete this comment?')) return
    try {
      const res = await fetch(
        `/api/comments?rkey=${encodeURIComponent(rkey)}`,
        { method: 'DELETE' },
      )
      if (res.ok) setComments((prev) => prev.filter((c) => c.rkey !== rkey))
    } catch {
      // Ignore — the comment stays visible until the next reload.
    }
  }

  const signIn = async () => {
    const h = handle.trim()
    if (!h) return
    setError(null)
    try {
      const returnTo =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : undefined
      await login(h, returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    }
  }

  return (
    <section className="max-w-3xl mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 mb-6">
          No comments yet. Be the first to respond.
        </p>
      ) : (
        <ul className="mb-6">
          {comments.map((c) => (
            <CommentItem
              key={c.uri}
              comment={c}
              canDelete={
                isAuthenticated &&
                (isAdmin || c.record.author.did === session?.did)
              }
              onDelete={remove}
            />
          ))}
        </ul>
      )}

      {isAuthenticated ? (
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
            Commenting as{' '}
            <span className="font-medium text-gray-800">
              {session?.displayName || session?.handle}
            </span>
            <button
              onClick={() => logout()}
              className="text-xs text-gray-400 hover:text-gray-700 ml-auto"
            >
              Sign out
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={3}
            placeholder="Add a comment…"
            className="w-full text-sm border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {text.length}/{MAX_COMMENT_LENGTH}
            </span>
            <button
              onClick={submit}
              disabled={submitting || !text.trim()}
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-md disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-3">
            Sign in with your Bluesky handle to comment. No password is stored —
            you authenticate directly with Bluesky.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && signIn()}
              placeholder="you.bsky.social"
              className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={signIn}
              disabled={!handle.trim()}
              className="text-sm bg-[#0085ff] text-white px-4 py-2 rounded-md disabled:opacity-40 hover:bg-[#0072dd] transition-colors whitespace-nowrap"
            >
              Sign in with Bluesky
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </section>
  )
}

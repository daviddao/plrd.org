import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ADMIN_DIDS } from "@/lib/lexicons"
import {
  listComments,
  createComment,
  deleteComment,
  getComment,
  MAX_COMMENT_LENGTH,
} from "@/lib/comments"
import type { CommentAuthor } from "@/lib/lexicons"

export const dynamic = "force-dynamic"

/**
 * GET /api/comments?subject=<slug> — list comments for a blog post. Public.
 */
export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get("subject")?.trim()
  if (!subject) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 })
  }
  try {
    const comments = await listComments(subject)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Failed to list comments:", error)
    return NextResponse.json(
      { error: "Failed to load comments" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/comments — create a comment. Requires a Bluesky OAuth session.
 * The author identity is taken from the verified session, never the request
 * body, so commenters cannot impersonate one another.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.did) {
    return NextResponse.json(
      { error: "Sign in with Bluesky to comment" },
      { status: 401 },
    )
  }

  let body: { subject?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const subject = body.subject?.trim()
  const text = body.text?.trim()
  if (!subject) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 })
  }
  if (!text) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
  }
  if (text.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` },
      { status: 400 },
    )
  }

  const author: CommentAuthor = {
    did: session.did,
    handle: session.handle || session.did,
    displayName: session.displayName,
    avatar: session.avatar,
  }

  try {
    const comment = await createComment(subject, text, author)
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Failed to create comment:", error)
    const message =
      error instanceof Error && error.message.includes("not configured")
        ? "Comments are not configured on this deployment"
        : "Failed to post comment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/comments?rkey=<rkey> — remove a comment. Allowed for the comment
 * author or any admin DID.
 */
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session.did) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rkey = req.nextUrl.searchParams.get("rkey")?.trim()
  if (!rkey) {
    return NextResponse.json({ error: "rkey is required" }, { status: 400 })
  }

  try {
    const existing = await getComment(rkey)
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    const isAuthor = existing.record.author.did === session.did
    const isAdmin = ADMIN_DIDS.includes(session.did)
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await deleteComment(rkey)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    )
  }
}

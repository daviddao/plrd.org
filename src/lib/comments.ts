import "server-only"
import { AtpAgent } from "@atproto/api"
import { env } from "./env"
import { generateTid } from "./tid"
import { COMMENT_COLLECTION } from "./lexicons"
import type { CommentAuthor, CommentRecord } from "./lexicons"

/**
 * Max length for a single comment body. Kept small on purpose for the
 * prototype — long-form belongs in a post, not a comment.
 */
export const MAX_COMMENT_LENGTH = 2000

export type Comment = {
  uri: string
  rkey: string
  record: CommentRecord
}

let cachedAgent: { agent: AtpAgent; expires: number } | null = null

/**
 * Agent authenticated as the plresearch.org service account via app password.
 *
 * Comments are stored in this single repo rather than in each commenter's own
 * PDS. That is a deliberate prototype tradeoff: it makes the read path a single
 * listRecords call (no firehose indexer needed) and gives admins one place to
 * moderate. Identity is still real — it comes from the commenter's verified
 * Bluesky OAuth session, embedded into the record server-side.
 */
async function getServiceAgent(): Promise<AtpAgent> {
  const handle = env.ATPROTO_HANDLE
  const password = env.ATPROTO_PASSWORD
  if (!handle || !password) {
    throw new Error(
      "Comments are not configured: ATPROTO_HANDLE and ATPROTO_PASSWORD must be set",
    )
  }
  // Reuse the logged-in agent for a few minutes to avoid re-authenticating on
  // every request.
  const now = Date.now()
  if (cachedAgent && cachedAgent.expires > now) {
    return cachedAgent.agent
  }
  const agent = new AtpAgent({ service: "https://bsky.social" })
  await agent.login({ identifier: handle, password })
  cachedAgent = { agent, expires: now + 5 * 60 * 1000 }
  return agent
}

/** The DID of the service repo that stores comments. */
async function getServiceDid(): Promise<string> {
  const agent = await getServiceAgent()
  const did = agent.session?.did
  if (!did) throw new Error("Service agent has no DID")
  return did
}

/**
 * List all comments for a given blog post subject (slug), oldest first.
 */
export async function listComments(subject: string): Promise<Comment[]> {
  const agent = await getServiceAgent()
  const did = await getServiceDid()

  const comments: Comment[] = []
  let cursor: string | undefined
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: COMMENT_COLLECTION,
      limit: 100,
      cursor,
    })
    for (const r of res.data.records) {
      const record = r.value as CommentRecord
      if (record.subject !== subject) continue
      comments.push({
        uri: r.uri,
        rkey: r.uri.split("/").pop()!,
        record,
      })
    }
    cursor = res.data.cursor
  } while (cursor)

  comments.sort(
    (a, b) =>
      new Date(a.record.createdAt).getTime() -
      new Date(b.record.createdAt).getTime(),
  )
  return comments
}

/**
 * Create a comment. `author` must come from a verified OAuth session — never
 * from client-supplied input — so commenters cannot impersonate one another.
 */
export async function createComment(
  subject: string,
  text: string,
  author: CommentAuthor,
): Promise<Comment> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Comment text is required")
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`)
  }

  const agent = await getServiceAgent()
  const did = await getServiceDid()
  const rkey = generateTid()

  const record: CommentRecord = {
    $type: COMMENT_COLLECTION,
    subject,
    text: trimmed,
    author,
    createdAt: new Date().toISOString(),
  }

  const result = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: COMMENT_COLLECTION,
    rkey,
    record,
    validate: false,
  })

  return { uri: result.data.uri, rkey, record }
}

/**
 * Delete a comment by rkey. Authorisation (author or admin) is enforced by the
 * caller before this runs.
 */
export async function deleteComment(rkey: string): Promise<void> {
  const agent = await getServiceAgent()
  const did = await getServiceDid()
  await agent.com.atproto.repo.deleteRecord({
    repo: did,
    collection: COMMENT_COLLECTION,
    rkey,
  })
}

/** Fetch a single comment record (used for delete authorisation checks). */
export async function getComment(rkey: string): Promise<Comment | null> {
  const agent = await getServiceAgent()
  const did = await getServiceDid()
  try {
    const res = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: COMMENT_COLLECTION,
      rkey,
    })
    return {
      uri: res.data.uri,
      rkey,
      record: res.data.value as CommentRecord,
    }
  } catch {
    return null
  }
}

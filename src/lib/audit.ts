import "server-only"
import { getAuthenticatedAgent } from "./agent"
import { EDIT_EVENT_COLLECTION } from "./lexicons"

/**
 * Shallow-diff two JSON-serialisable objects and return the list of top-level
 * field names whose values differ. Arrays and nested objects are compared by
 * JSON.stringify equality — good enough for our flat-ish record shapes.
 */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>,
): string[] {
  const keys = new Set<string>([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ])
  const changed: string[] = []
  // Fields that change on every edit (auto-managed), or that only exist on
  // the indexer-shaped "prior" object (synthesized from the GraphQL response),
  // never on the outgoing "after" record. Excluded from the user-facing diff.
  const ignored = new Set([
    'updatedAt', '$type', 'id', 'areaSlug', 'pageId',
    'uri', 'rkey', 'did', 'cid',
  ])
  for (const k of keys) {
    if (ignored.has(k)) continue
    const a = (before as Record<string, unknown> | null)?.[k]
    const b = after[k]
    if (JSON.stringify(a) !== JSON.stringify(b)) changed.push(k)
  }
  return changed
}

export type EditEventInput = {
  targetUri: string
  targetCid?: string
  collection: string
  changedFields?: string[]
  note?: string
}

/**
 * Append an audit-log entry to the editor's own PDS. Called after a successful
 * content write so that attribution is cryptographically tied to the editor's
 * repo rather than the content-owner's (plresearch.org).
 *
 * Swallows errors — a failure here must NOT fail the primary edit. Logs to
 * stderr so the failure is visible in Vercel logs.
 */
export async function writeEditEvent(input: EditEventInput): Promise<void> {
  try {
    const agent = await getAuthenticatedAgent()
    if (!agent) {
      console.warn('[audit] no authenticated agent — skipping edit event')
      return
    }

    // Best-effort handle snapshot so old entries stay legible if the editor
    // later changes their handle. Pulled from the authenticated OAuth session.
    const did = agent.assertDid
    let handle: string | undefined
    try {
      const profile = await agent.app.bsky.actor.getProfile({ actor: did })
      handle = profile.data.handle
    } catch (err) {
      console.warn('[audit] could not resolve editor handle:', err)
    }

    await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: EDIT_EVENT_COLLECTION,
      record: {
        $type: EDIT_EVENT_COLLECTION,
        target: input.targetUri,
        targetCid: input.targetCid,
        collection: input.collection,
        editor: did,
        editorHandle: handle,
        changedFields: input.changedFields ?? [],
        note: input.note,
        editedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[audit] failed to write edit event:', err)
  }
}

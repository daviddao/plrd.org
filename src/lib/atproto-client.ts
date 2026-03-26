import { AtpAgent } from '@atproto/api'
import { CURATEDLIST_COLLECTION, ADMIN_DID, POST_COLLECTION, PAGE_COLLECTION } from './lexicons'
import type { CuratedListRecord, CuratedListEntry, PostRecord, PostEntry, PageRecord } from './lexicons'

/**
 * Public Bluesky API agent (for resolving handles and profiles)
 */
const publicAgent = new AtpAgent({ service: 'https://public.api.bsky.app' })

/**
 * Cache for PDS URLs
 */
const pdsCache = new Map<string, string>()

/**
 * Resolve a DID to its PDS URL via plc.directory
 */
export async function resolvePds(did: string): Promise<string | null> {
  const cached = pdsCache.get(did)
  if (cached) return cached

  try {
    const response = await fetch(`https://plc.directory/${did}`)
    if (!response.ok) return null

    const doc = await response.json()
    const pdsService = doc.service?.find(
      (s: { id: string; type: string; serviceEndpoint: string }) =>
        s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer'
    )

    if (!pdsService?.serviceEndpoint) return null

    const pdsUrl = pdsService.serviceEndpoint
    pdsCache.set(did, pdsUrl)
    return pdsUrl
  } catch {
    return null
  }
}

/**
 * Create an AtpAgent for a specific PDS
 */
export function getPdsAgent(pdsUrl: string): AtpAgent {
  return new AtpAgent({ service: pdsUrl })
}

/**
 * Resolve a handle to a DID using the public API
 */
export async function resolveHandle(handle: string): Promise<string | null> {
  try {
    const normalizedHandle = handle.includes('.') ? handle : `${handle}.bsky.social`
    const response = await publicAgent.resolveHandle({ handle: normalizedHandle })
    return response.data.did
  } catch {
    return null
  }
}

/**
 * Get profile data from the public API
 */
export async function getPublicProfile(actor: string) {
  try {
    const response = await publicAgent.getProfile({ actor })
    return response.data
  } catch {
    return null
  }
}

// Singleton rkey for the curated list record
const CURATED_LIST_RKEY = 'self'

/**
 * Get the full curated list with metadata
 */
export async function getCuratedList(): Promise<CuratedListEntry[]> {
  try {
    const pdsUrl = await resolvePds(ADMIN_DID)
    if (!pdsUrl) return []

    const pdsAgent = getPdsAgent(pdsUrl)
    const response = await pdsAgent.com.atproto.repo.getRecord({
      repo: ADMIN_DID,
      collection: CURATEDLIST_COLLECTION,
      rkey: CURATED_LIST_RKEY,
    })

    const record = response.data.value as CuratedListRecord
    if (!record?.users || !Array.isArray(record.users)) {
      return []
    }

    return record.users
  } catch {
    return []
  }
}

/**
 * Get the curated list record CID for swap updates
 */
export async function getCuratedListRecordCid(): Promise<string | undefined> {
  try {
    const pdsUrl = await resolvePds(ADMIN_DID)
    if (!pdsUrl) return undefined

    const pdsAgent = getPdsAgent(pdsUrl)
    const response = await pdsAgent.com.atproto.repo.getRecord({
      repo: ADMIN_DID,
      collection: CURATEDLIST_COLLECTION,
      rkey: CURATED_LIST_RKEY,
    })

    return response.data.cid
  } catch {
    return undefined
  }
}

/**
 * Fetch posts from a user's PDS
 */
export async function getUserPosts(did: string): Promise<PostEntry[]> {
  try {
    const pdsUrl = await resolvePds(did)
    if (!pdsUrl) return []

    const pdsAgent = getPdsAgent(pdsUrl)
    const response = await pdsAgent.com.atproto.repo.listRecords({
      repo: did,
      collection: POST_COLLECTION,
      limit: 100,
    })

    const profile = await getPublicProfile(did)

    return response.data.records.map((record) => ({
      uri: record.uri,
      cid: record.cid,
      author: {
        did,
        handle: profile?.handle || did,
        displayName: profile?.displayName,
        avatar: profile?.avatar,
      },
      record: record.value as PostRecord,
    }))
  } catch {
    return []
  }
}

/**
 * Fetch all posts from curated accounts
 */
export async function getFeedPosts(): Promise<PostEntry[]> {
  const curatedList = await getCuratedList()
  const allPosts: PostEntry[] = []

  for (const entry of curatedList) {
    const posts = await getUserPosts(entry.did)
    allPosts.push(...posts)
  }

  // Also fetch admin's own posts
  const adminPosts = await getUserPosts(ADMIN_DID)
  // Avoid duplicates if admin is in curated list
  const existingUris = new Set(allPosts.map(p => p.uri))
  for (const post of adminPosts) {
    if (!existingUris.has(post.uri)) {
      allPosts.push(post)
    }
  }

  // Sort by date descending
  allPosts.sort((a, b) =>
    new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime()
  )

  return allPosts
}

export { CURATED_LIST_RKEY }

/**
 * Fetch a single page record from the admin PDS.
 */
export async function getPageRecord(rkey: string): Promise<PageRecord | null> {
  try {
    const pdsUrl = await resolvePds(ADMIN_DID)
    if (!pdsUrl) return null
    const pdsAgent = getPdsAgent(pdsUrl)
    const response = await pdsAgent.com.atproto.repo.getRecord({
      repo: ADMIN_DID,
      collection: PAGE_COLLECTION,
      rkey,
    })
    return response.data.value as PageRecord
  } catch {
    return null
  }
}

/**
 * Fetch all page records from the admin PDS.
 */
export async function getAllPageRecords(): Promise<{ rkey: string; record: PageRecord }[]> {
  try {
    const pdsUrl = await resolvePds(ADMIN_DID)
    if (!pdsUrl) return []
    const pdsAgent = getPdsAgent(pdsUrl)
    const response = await pdsAgent.com.atproto.repo.listRecords({
      repo: ADMIN_DID,
      collection: PAGE_COLLECTION,
      limit: 100,
    })
    return response.data.records.map((r) => ({
      rkey: r.uri.split("/").pop()!,
      record: r.value as PageRecord,
    }))
  } catch {
    return []
  }
}

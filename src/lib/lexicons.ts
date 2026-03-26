/**
 * ATProto Lexicon Collection NSIDs for PL R&D
 */

// Post collection - markdown articles (blog posts, publications, talks, tutorials)
export const POST_COLLECTION = 'org.plresearch.post'

// Curated list collection - admin-managed list of users whose posts to display
export const CURATEDLIST_COLLECTION = 'org.plresearch.curatedlist'

// Admin DID - the only user who can manage the curated list
// Uses NEXT_PUBLIC_ prefix so it's available in both server and client code
export const ADMIN_DID = process.env.NEXT_PUBLIC_ADMIN_DID || 'did:plc:qc42fmqqlsmdq7jiypiiigww'

// Post types
export type PostType = 'blog' | 'publication' | 'talk' | 'tutorial'

// Post record stored on ATProto
export type PostRecord = {
  $type: string
  title: string
  content: string
  summary?: string
  postType: PostType
  venue?: string
  authors?: string[]
  doi?: string
  createdAt: string
}

// Curated list entry
export type CuratedListEntry = {
  did: string
  handle: string
  addedAt: string
}

// Curated list record stored on ATProto
export type CuratedListRecord = {
  $type: string
  users: CuratedListEntry[]
  createdAt: string
  updatedAt: string
}

// Page collections
export const PAGE_COLLECTION = "org.plresearch.page"
export const OPPORTUNITY_COLLECTION = "org.plresearch.opportunitySpace"

// Page section
export type PageSection = {
  sectionId: string
  label?: string
  title?: string
  subtitle?: string
  body?: string
}

// Page record stored on ATProto
export type PageRecord = {
  $type: string
  pageId: string
  iconType?: string
  leads?: string[]
  advisors?: string[]
  sections: PageSection[]
  updatedAt: string
}

// All known page rkeys
export const PAGE_RKEYS = [
  "landing", "about", "areas", "collaborate",
  "area-ai-robotics", "area-digital-human-rights", "area-neurotech",
  "area-economies-governance", "area-eg-subareas", "area-eg-impact",
] as const

export type PageRkey = typeof PAGE_RKEYS[number]

// Post with metadata for display
export type PostEntry = {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  record: PostRecord
}

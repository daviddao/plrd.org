/**
 * ATProto Lexicon Collection NSIDs for PL R&D
 */

// Primary admin DID (plresearch.org) — used for reading/writing page records
export const ADMIN_DID = process.env.NEXT_PUBLIC_ADMIN_DID || 'did:plc:pgwr6hkosgznfl5nz7egajei'

// All DIDs allowed to use the admin panel
// Comma-separated in NEXT_PUBLIC_ADMIN_DIDS env var, falls back to defaults
const DEFAULT_ADMIN_DIDS = [
  ADMIN_DID,                              // plresearch.org
  'did:plc:cpoagodpqrgs4t7thi5z37uf',     // satyam2.climateai.org
]
const _adminDidsRaw = process.env.NEXT_PUBLIC_ADMIN_DIDS || DEFAULT_ADMIN_DIDS.join(',')
export const ADMIN_DIDS: string[] = _adminDidsRaw.split(',').map(d => d.trim()).filter(Boolean)

// Post collection (write page / blog posts authored on this PDS)
export const POST_COLLECTION = 'org.plresearch.post'

export type PostType = 'blog' | 'publication' | 'talk' | 'tutorial'

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

// standard.site lexicons for long-form publishing
export const STANDARD_PUBLICATION_COLLECTION = "site.standard.publication"
export const STANDARD_DOCUMENT_COLLECTION = "site.standard.document"

// Content format for our markdown posts (custom type embedded in the open union)
export const PLRESEARCH_CONTENT_TYPE = "org.plresearch.markdownContent"

export type StandardDocumentRecord = {
  $type: "site.standard.document"
  site: string          // AT-URI of publication or URL
  title: string
  publishedAt: string   // ISO datetime
  path: string          // e.g. /blog/my-post
  description?: string
  textContent?: string  // plaintext for indexing
  tags?: string[]
  updatedAt?: string
  content?: {
    $type: string       // org.plresearch.markdownContent
    markdown: string    // the markdown body
    postType?: string   // blog | publication | talk | tutorial
    venue?: string
    authors?: string[]
    doi?: string
  }
}

export type StandardPublicationRecord = {
  $type: "site.standard.publication"
  url: string
  name: string
  description?: string
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

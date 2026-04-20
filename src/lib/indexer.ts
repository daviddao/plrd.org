import "server-only"

const HYPERINDEX_URL = process.env.INDEXER_URL || process.env.NEXT_PUBLIC_INDEXER_URL || "https://plresearch-indexer-production.up.railway.app/graphql"
const PLRESEARCH_DID = "did:plc:pgwr6hkosgznfl5nz7egajei"

// ---- Types ----

export type IndexerPageSection = {
  sectionId: string
  label?: string | null
  title?: string | null
  subtitle?: string | null
  body?: string | null
}

export type IndexerPage = {
  uri?: string
  rkey?: string
  pageId: string
  iconType?: string | null
  leads?: string[] | null
  advisors?: string[] | null
  sections: IndexerPageSection[]
  updatedAt: string
}

export type IndexerFieldSignal = {
  kpi: string
  measurement: string
}

export type IndexerOpportunitySpace = {
  uri?: string
  rkey?: string
  areaSlug: string
  id: string
  title: string
  tagline?: string | null
  image?: string | null
  description: string
  inflectionPoint?: string | null
  shift?: string | null
  theOpportunity?: string | null
  subfields: string[]
  tippingSignals?: string[] | null
  keyAssumptions?: string[] | null
  observations?: string[] | null
  fieldSignals?: IndexerFieldSignal[] | null
  updatedAt: string
}

export type IndexerEditEvent = {
  uri?: string
  did?: string           // the editor's DID (repo owner)
  target: string         // AT-URI of the edited record
  targetCid?: string | null
  collection?: string | null
  editor: string         // DID of the editor (usually same as did above)
  editorHandle?: string | null
  changedFields?: string[] | null
  note?: string | null
  editedAt: string
}

// ---- GraphQL helper ----

async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(HYPERINDEX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: gql, variables }),
      next: { revalidate: 60, tags: ["indexer"] },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.errors) {
      console.error("[indexer] GraphQL errors:", json.errors)
      return null
    }
    return json.data as T
  } catch (err) {
    console.error("[indexer] fetch failed:", err)
    return null
  }
}

// ---- Page queries ----

const PAGE_FIELDS = `
  uri pageId iconType leads advisors updatedAt
  sections { sectionId label title subtitle body }
`

export async function fetchPage(rkey: string): Promise<IndexerPage | null> {
  const data = await query<{
    orgPlresearchPage: { edges: { node: IndexerPage }[] }
  }>(`{
    orgPlresearchPage(
      where: { did: { eq: "${PLRESEARCH_DID}" }, pageId: { eq: "${rkey}" } }
      first: 1
    ) {
      edges { node { ${PAGE_FIELDS} } }
    }
  }`)
  const node = data?.orgPlresearchPage?.edges?.[0]?.node ?? null
  if (node && node.uri && !node.rkey) {
    // Extract rkey from AT URI: at://did/collection/rkey
    const parts = node.uri.split('/')
    node.rkey = parts[parts.length - 1]
  }
  return node
}

export async function fetchAllPages(): Promise<IndexerPage[]> {
  const data = await query<{
    orgPlresearchPage: { edges: { node: IndexerPage }[] }
  }>(`{
    orgPlresearchPage(
      where: { did: { eq: "${PLRESEARCH_DID}" } }
      first: 100
    ) {
      edges { node { ${PAGE_FIELDS} } }
    }
  }`)
  return data?.orgPlresearchPage?.edges?.map(e => {
    const node = e.node
    if (node.uri && !node.rkey) {
      const parts = node.uri.split('/')
      node.rkey = parts[parts.length - 1]
    }
    return node
  }) ?? []
}

// ---- Opportunity Space queries ----

const OS_FIELDS = `
  uri areaSlug id title tagline image description
  inflectionPoint shift theOpportunity
  subfields tippingSignals keyAssumptions observations
  fieldSignals { kpi measurement }
  updatedAt
`

export async function fetchOpportunitySpaces(areaSlug: string): Promise<IndexerOpportunitySpace[]> {
  const data = await query<{
    orgPlresearchOpportunitySpace: { edges: { node: IndexerOpportunitySpace }[] }
  }>(`{
    orgPlresearchOpportunitySpace(
      where: { did: { eq: "${PLRESEARCH_DID}" }, areaSlug: { eq: "${areaSlug}" } }
      first: 50
    ) {
      edges { node { ${OS_FIELDS} } }
    }
  }`)
  return data?.orgPlresearchOpportunitySpace?.edges?.map(e => {
    const node = e.node
    if (node.uri && !node.rkey) {
      const parts = node.uri.split('/')
      node.rkey = parts[parts.length - 1]
    }
    return node
  }) ?? []
}

export async function fetchOpportunitySpace(rkey: string): Promise<IndexerOpportunitySpace | null> {
  // Query by URI since lex-gql uses uri not rkey
  const uri = `at://${PLRESEARCH_DID}/org.plresearch.opportunitySpace/${rkey}`
  const data = await query<{
    orgPlresearchOpportunitySpace: { edges: { node: IndexerOpportunitySpace }[] }
  }>(`{
    orgPlresearchOpportunitySpace(
      where: { uri: { eq: "${uri}" } }
      first: 1
    ) {
      edges { node { ${OS_FIELDS} } }
    }
  }`)
  const node = data?.orgPlresearchOpportunitySpace?.edges?.[0]?.node ?? null
  if (node && node.uri && !node.rkey) {
    const parts = node.uri.split('/')
    node.rkey = parts[parts.length - 1]
  }
  return node
}

// ---- Edit event queries ----

const EDIT_EVENT_FIELDS = `
  uri did target targetCid collection
  editor editorHandle changedFields note editedAt
`

/**
 * Fetch all audit-log entries that target a given AT-URI, newest first.
 * Queries ALL admin DIDs (not scoped to plresearch.org) because edit events
 * are written to each editor's own repo.
 */
export async function fetchEditEvents(targetUri: string): Promise<IndexerEditEvent[]> {
  const data = await query<{
    orgPlresearchEditEvent: { edges: { node: IndexerEditEvent }[] }
  }>(`{
    orgPlresearchEditEvent(
      where: { target: { eq: "${targetUri}" } }
      first: 100
    ) {
      edges { node { ${EDIT_EVENT_FIELDS} } }
    }
  }`)
  const events = data?.orgPlresearchEditEvent?.edges?.map(e => e.node) ?? []
  // Sort by editedAt descending — the indexer doesn't guarantee order.
  return events.sort((a, b) => (b.editedAt ?? '').localeCompare(a.editedAt ?? ''))
}

// ---- ATProto post queries (site.standard.document via generic records) ----

export type IndexerPost = {
  rkey: string
  uri: string
  title: string
  description?: string | null
  publishedAt: string
  path?: string | null
  tags?: string[] | null
  content?: {
    $type: string
    markdown?: string
    postType?: string
  } | null
}

export async function fetchAtproPosts(): Promise<IndexerPost[]> {
  const data = await query<{
    records: {
      edges: {
        node: {
          rkey: string
          uri: string
          value: {
            title?: string
            description?: string
            publishedAt?: string
            path?: string
            tags?: string[]
            content?: {
              $type: string
              markdown?: string
              postType?: string
            }
          }
        }
      }[]
    }
  }>(`{
    records(
      collection: "site.standard.document"
      first: 50
    ) {
      edges {
        node {
          rkey
          uri
          value
        }
      }
    }
  }`)

  return (
    data?.records?.edges
      ?.map((e) => ({
        rkey: e.node.rkey,
        uri: e.node.uri,
        title: e.node.value?.title || "",
        description: e.node.value?.description,
        publishedAt: e.node.value?.publishedAt || "",
        path: e.node.value?.path,
        tags: e.node.value?.tags,
        content: e.node.value?.content,
      }))
      .filter((p) => p.title && p.publishedAt) ?? []
  )
}

// ---- Helpers ----

/** Get a specific section from a page by sectionId */
export function getSection(page: IndexerPage | null, sectionId: string): IndexerPageSection | null {
  return page?.sections?.find(s => s.sectionId === sectionId) ?? null
}

/** Get all sections matching a prefix (e.g. "approach-" for all approach sections) */
export function getSectionsWithPrefix(page: IndexerPage | null, prefix: string): IndexerPageSection[] {
  return page?.sections?.filter(s => s.sectionId.startsWith(prefix)) ?? []
}

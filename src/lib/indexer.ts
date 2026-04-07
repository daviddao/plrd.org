import "server-only"

const HYPERINDEX_URL = process.env.INDEXER_URL || process.env.NEXT_PUBLIC_INDEXER_URL || "https://api.hi.gainforest.app/graphql"
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
  rkey: string
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
  rkey: string
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
  rkey pageId iconType leads advisors updatedAt
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
  return data?.orgPlresearchPage?.edges?.[0]?.node ?? null
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
  return data?.orgPlresearchPage?.edges?.map(e => e.node) ?? []
}

// ---- Opportunity Space queries ----

const OS_FIELDS = `
  rkey areaSlug id title tagline image description
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
  return data?.orgPlresearchOpportunitySpace?.edges?.map(e => e.node) ?? []
}

export async function fetchOpportunitySpace(rkey: string): Promise<IndexerOpportunitySpace | null> {
  const data = await query<{
    orgPlresearchOpportunitySpace: { edges: { node: IndexerOpportunitySpace }[] }
  }>(`{
    orgPlresearchOpportunitySpace(
      where: { did: { eq: "${PLRESEARCH_DID}" }, rkey: { eq: "${rkey}" } }
      first: 1
    ) {
      edges { node { ${OS_FIELDS} } }
    }
  }`)
  return data?.orgPlresearchOpportunitySpace?.edges?.[0]?.node ?? null
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

import { NextRequest, NextResponse } from "next/server"
import { AtpAgent } from "@atproto/api"
import { revalidateTag } from "next/cache"
import { fetchOpportunitySpace } from "@/lib/indexer"
import { getSession } from "@/lib/session"
import { ADMIN_DID, ADMIN_DIDS, OPPORTUNITY_COLLECTION } from "@/lib/lexicons"
import { env } from "@/lib/env"
import type { OpportunitySpaceRecord } from "@/lib/lexicons"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ rkey: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { rkey } = await params
  try {
    const record = await fetchOpportunitySpace(rkey)
    if (!record) {
      return NextResponse.json({ error: "Opportunity space not found" }, { status: 404 })
    }
    return NextResponse.json({ rkey, record })
  } catch {
    return NextResponse.json({ error: "Failed to fetch opportunity space" }, { status: 500 })
  }
}

/**
 * Authenticate as plresearch.org via app password — required because
 * opportunity-space records live on plresearch.org's repo even when an
 * admin signed in as a different DID is performing the edit.
 * Mirrors the getPlresearchAgent() in /api/pages/[rkey]/route.ts.
 */
async function getPlresearchAgent(): Promise<AtpAgent> {
  const handle = env.ATPROTO_HANDLE
  const password = env.ATPROTO_PASSWORD
  if (!handle || !password) {
    throw new Error("ATPROTO_HANDLE and ATPROTO_PASSWORD must be set")
  }
  const agent = new AtpAgent({ service: "https://bsky.social" })
  await agent.login({ identifier: handle, password })
  return agent
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { rkey } = await params
  const session = await getSession()

  if (!session.did) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!ADMIN_DIDS.includes(session.did)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
  }

  try {
    const body = (await req.json()) as OpportunitySpaceRecord

    // Required fields per the lexicon
    if (!body.areaSlug || !body.id || !body.title || !body.description) {
      return NextResponse.json(
        { error: "Invalid opportunity space record — areaSlug, id, title, description are required" },
        { status: 400 },
      )
    }

    const agent = await getPlresearchAgent()
    const response = await agent.com.atproto.repo.putRecord({
      repo: ADMIN_DID,
      collection: OPPORTUNITY_COLLECTION,
      rkey,
      record: {
        $type: OPPORTUNITY_COLLECTION,
        areaSlug: body.areaSlug,
        id: body.id,
        title: body.title,
        tagline: body.tagline,
        image: body.image,
        description: body.description,
        inflectionPoint: body.inflectionPoint,
        shift: body.shift,
        theOpportunity: body.theOpportunity,
        subfields: body.subfields ?? [],
        tippingSignals: body.tippingSignals ?? [],
        keyAssumptions: body.keyAssumptions ?? [],
        observations: body.observations ?? [],
        fieldSignals: body.fieldSignals ?? [],
        updatedAt: new Date().toISOString(),
      },
    })

    revalidateTag("indexer")

    return NextResponse.json({ uri: response.data.uri, cid: response.data.cid })
  } catch (error) {
    console.error("Failed to update opportunity space:", error)
    return NextResponse.json({ error: "Failed to update opportunity space" }, { status: 500 })
  }
}

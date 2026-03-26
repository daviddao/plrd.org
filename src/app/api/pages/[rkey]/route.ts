import { NextRequest, NextResponse } from "next/server"
import { getPageRecord } from "@/lib/atproto-client"
import { getAuthenticatedAgent } from "@/lib/agent"
import { getSession } from "@/lib/session"
import { ADMIN_DID, PAGE_COLLECTION } from "@/lib/lexicons"
import type { PageRecord } from "@/lib/lexicons"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ rkey: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { rkey } = await params
  try {
    const record = await getPageRecord(rkey)
    if (!record) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }
    return NextResponse.json({ rkey, record })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { rkey } = await params
  const session = await getSession()

  // Auth check
  if (!session.did) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Admin check — only the admin DID can edit pages
  if (session.did !== ADMIN_DID) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
  }

  const agent = await getAuthenticatedAgent()
  if (!agent) {
    return NextResponse.json({ error: "Failed to restore session" }, { status: 401 })
  }

  try {
    const body: PageRecord = await req.json()

    // Validate required fields
    if (!body.pageId || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: "Invalid page record" }, { status: 400 })
    }

    // Write to the admin repo using putRecord (create or update)
    const response = await agent.com.atproto.repo.putRecord({
      repo: session.did,
      collection: PAGE_COLLECTION,
      rkey,
      record: {
        $type: PAGE_COLLECTION,
        pageId: body.pageId,
        iconType: body.iconType,
        leads: body.leads,
        advisors: body.advisors,
        sections: body.sections,
        updatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ uri: response.data.uri, cid: response.data.cid })
  } catch (error) {
    console.error("Failed to update page:", error)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}

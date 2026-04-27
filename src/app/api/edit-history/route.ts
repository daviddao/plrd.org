import { NextRequest, NextResponse } from "next/server"
import { fetchEditEvents } from "@/lib/indexer"
import { getSession } from "@/lib/session"
import { ADMIN_DIDS } from "@/lib/lexicons"

export const dynamic = "force-dynamic"

/**
 * Returns audit-log entries for a given AT-URI, newest first.
 * Caller: `GET /api/edit-history?target=at://did/collection/rkey`
 *
 * Admin-only: edit history reveals the editor DIDs/handles behind every change
 * to a CMS-editable record, which is internal-facing data. Non-admin callers
 * receive 401/403; the matching client component (`EditHistoryByline`)
 * suppresses itself for non-admins so the byline never flashes.
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.did) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!ADMIN_DIDS.includes(session.did)) {
    return NextResponse.json({ error: "Forbidden \u2014 admin only" }, { status: 403 })
  }

  const target = req.nextUrl.searchParams.get("target")
  if (!target || !target.startsWith("at://")) {
    return NextResponse.json(
      { error: "Query param `target` must be a valid AT-URI" },
      { status: 400 },
    )
  }
  try {
    const events = await fetchEditEvents(target)
    return NextResponse.json({ target, count: events.length, events })
  } catch (error) {
    console.error("Failed to fetch edit history:", error)
    return NextResponse.json({ error: "Failed to fetch edit history" }, { status: 500 })
  }
}

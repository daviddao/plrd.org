import { NextRequest, NextResponse } from "next/server"
import { fetchEditEvents } from "@/lib/indexer"

export const dynamic = "force-dynamic"

/**
 * Returns audit-log entries for a given AT-URI, newest first.
 * Caller: `GET /api/edit-history?target=at://did/collection/rkey`
 *
 * No auth gate — edit history is public. The lexicon does not store diffs,
 * only field names, so revealing it does not leak pre-publish content.
 */
export async function GET(req: NextRequest) {
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

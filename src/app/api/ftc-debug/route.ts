import { NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

const DASHBOARD_PATH =
  "/areas/economies-governance/impact/live-dashboard"

// TEMP diagnostic: surfaces exactly what the Vercel runtime sees when it queries
// the PL Research indexer for FtC metricPoints. Delete after debugging.
export async function GET(req: Request) {
  const url =
    process.env.INDEXER_URL ??
    process.env.NEXT_PUBLIC_INDEXER_URL ??
    "https://plresearch-indexer-production.up.railway.app/graphql"

  const out: Record<string, unknown> = {
    resolvedUrl: url,
    hasIndexerEnv: !!process.env.INDEXER_URL,
    hasPublicIndexerEnv: !!process.env.NEXT_PUBLIC_INDEXER_URL,
  }

  // ?purge=1 clears the stuck FtC fetch cache + the dashboard ISR page.
  if (new URL(req.url).searchParams.get("purge")) {
    revalidateTag("ftc")
    revalidatePath(DASHBOARD_PATH)
    out.purged = true
  }

  try {
    const started = Date.now()
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        query:
          "{ ioFundingthecommonsImpactMetricPoint(first: 2) { edges { node { metric value date type } } pageInfo { hasNextPage endCursor } } }",
      }),
    })
    out.ms = Date.now() - started
    out.status = res.status
    out.ok = res.ok
    const text = await res.text()
    out.bodySample = text.slice(0, 600)
  } catch (err) {
    out.threw = true
    out.errorName = err instanceof Error ? err.name : typeof err
    out.errorMessage = err instanceof Error ? err.message : String(err)
    out.errorCause =
      err instanceof Error && err.cause ? String(err.cause) : undefined
  }

  return NextResponse.json(out)
}

import { NextResponse } from "next/server"
import { fetchAllPages } from "@/lib/indexer"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const pages = await fetchAllPages()
    return NextResponse.json({
      pages: pages.map(p => ({ rkey: p.rkey, record: p }))
    })
  } catch (error) {
    console.error("Failed to fetch pages:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

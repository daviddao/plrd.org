import { NextResponse } from "next/server"
import { getAllPageRecords } from "@/lib/atproto-client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const pages = await getAllPageRecords()
    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Failed to fetch pages:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

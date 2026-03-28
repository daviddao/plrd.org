import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const uri = process.env.NEXT_PUBLIC_PUBLICATION_URI
  if (!uri) {
    return new NextResponse("Publication record not configured", { status: 404 })
  }
  // standard.site expects plain text AT-URI
  return new NextResponse(uri, {
    headers: { "Content-Type": "text/plain" },
  })
}

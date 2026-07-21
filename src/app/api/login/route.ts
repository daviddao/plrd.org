import { NextRequest, NextResponse } from 'next/server'
import { getGlobalOAuthClient } from '@/lib/auth/client'
import { isValidHandle } from '@atproto/syntax'
import { OAuthResolverError } from '@atproto/oauth-client-node'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const client = await getGlobalOAuthClient()
    const body = await request.json()
    const handle = body?.handle
    // Optional same-origin path to return to after login (e.g. the blog post
    // the reader was on when they clicked "Sign in to comment").
    const returnTo =
      typeof body?.returnTo === 'string' && body.returnTo.startsWith('/')
        ? body.returnTo
        : undefined

    if (typeof handle !== 'string' || !isValidHandle(handle)) {
      return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
    }

    const url = await client.authorize(handle, {
      scope: 'atproto transition:generic',
      state: returnTo,
    })

    return NextResponse.json({ redirectUrl: url.toString() })
  } catch (error) {
    console.error('OAuth authorize failed:', error)
    let errorMessage = "Couldn't initiate login"

    if (error instanceof OAuthResolverError) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

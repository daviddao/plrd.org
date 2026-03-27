import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAgent } from '@/lib/agent'
import { getCuratedList, getCuratedListRecordCid, resolvePds, getPdsAgent, resolveHandle } from '@/lib/atproto-client'
import { getSession } from '@/lib/session'
import { CURATEDLIST_COLLECTION, ADMIN_DIDS } from '@/lib/lexicons'
import type { CuratedListRecord, CuratedListEntry } from '@/lib/lexicons'
import { CURATED_LIST_RKEY } from '@/lib/atproto-client'

export const dynamic = 'force-dynamic'

function isAdmin(did: string | undefined): boolean {
  return did != null && ADMIN_DIDS.includes(did)
}

/**
 * GET /api/curated-list - Get the curated list (public)
 */
export async function GET() {
  try {
    const users = await getCuratedList()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch curated list:', error)
    return NextResponse.json({ users: [] })
  }
}

/**
 * POST /api/curated-list - Add a user to the curated list (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.did || !isAdmin(session.did)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const agent = await getAuthenticatedAgent()
    if (!agent) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 })
    }

    const body = await request.json()
    const { handle } = body

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }

    const did = await resolveHandle(handle.trim())
    if (!did) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUsers = await getCuratedList()

    if (currentUsers.some(u => u.did === did)) {
      return NextResponse.json({ error: 'User already in curated list' }, { status: 400 })
    }

    const newEntry: CuratedListEntry = {
      did,
      handle: handle.trim(),
      addedAt: new Date().toISOString(),
    }

    const updatedUsers = [...currentUsers, newEntry]

    const record: CuratedListRecord = {
      $type: CURATEDLIST_COLLECTION,
      users: updatedUsers,
      createdAt: currentUsers.length === 0 ? new Date().toISOString() : updatedUsers[0]?.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const existingCid = await getCuratedListRecordCid()

    if (existingCid) {
      await agent.com.atproto.repo.putRecord({
        repo: session.did,
        collection: CURATEDLIST_COLLECTION,
        rkey: CURATED_LIST_RKEY,
        record,
        swapRecord: existingCid,
      })
    } else {
      await agent.com.atproto.repo.createRecord({
        repo: session.did,
        collection: CURATEDLIST_COLLECTION,
        rkey: CURATED_LIST_RKEY,
        record,
      })
    }

    return NextResponse.json({ success: true, users: updatedUsers })
  } catch (error) {
    console.error('Failed to add user to curated list:', error)
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 })
  }
}

/**
 * DELETE /api/curated-list - Remove a user from the curated list (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.did || !isAdmin(session.did)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const agent = await getAuthenticatedAgent()
    if (!agent) {
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const didToRemove = searchParams.get('did')

    if (!didToRemove) {
      return NextResponse.json({ error: 'DID is required' }, { status: 400 })
    }

    const currentUsers = await getCuratedList()
    const updatedUsers = currentUsers.filter(u => u.did !== didToRemove)

    if (updatedUsers.length === currentUsers.length) {
      return NextResponse.json({ error: 'User not found in curated list' }, { status: 404 })
    }

    const existingCid = await getCuratedListRecordCid()
    if (!existingCid) {
      return NextResponse.json({ error: 'Curated list not found' }, { status: 500 })
    }

    const record: CuratedListRecord = {
      $type: CURATEDLIST_COLLECTION,
      users: updatedUsers,
      createdAt: currentUsers[0]?.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await agent.com.atproto.repo.putRecord({
      repo: session.did,
      collection: CURATEDLIST_COLLECTION,
      rkey: CURATED_LIST_RKEY,
      record,
      swapRecord: existingCid,
    })

    return NextResponse.json({ success: true, users: updatedUsers })
  } catch (error) {
    console.error('Failed to remove user:', error)
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
  }
}

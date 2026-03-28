#!/usr/bin/env node
// Run: node scripts/create-publication.mjs

import { AtpAgent } from "@atproto/api"
import { TID } from "@atproto/common-web"

const agent = new AtpAgent({ service: "https://bsky.social" })

await agent.login({
  identifier: process.env.ATPROTO_HANDLE || "plresearch.org",
  password: process.env.ATPROTO_PASSWORD,
})

const rkey = TID.nextStr()

const record = {
  $type: "site.standard.publication",
  url: "https://www.plresearch.org",
  name: "PL R&D",
  description: "Protocol Labs R&D — driving research breakthroughs to push humanity forward.",
}

const result = await agent.com.atproto.repo.createRecord({
  repo: agent.session.did,
  collection: "site.standard.publication",
  rkey,
  validate: false,
  record,
})

console.log("Created publication record:")
console.log("URI:", result.data.uri)
console.log("CID:", result.data.cid)
console.log()
console.log("Add this to your .env:")
console.log(`NEXT_PUBLIC_PUBLICATION_URI=${result.data.uri}`)

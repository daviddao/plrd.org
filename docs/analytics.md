# Analytics & UTM conventions

How we measure traffic on **www.plrd.org** and how to tag links so campaign
attribution stays clean and consistent.

## What's running

| Tool | What it does | Cookies? | Config |
|---|---|---|---|
| **Google Analytics 4** | Full analytics: acquisition, campaigns, events | Yes (`_ga`) | `NEXT_PUBLIC_GA_ID` (Vercel). Measurement ID `G-M8LW4KE782`, property **PL R&D**. Gated behind cookie consent for EU/EEA + UK visitors. |
| **GoatCounter** | Lightweight, privacy-friendly page counts | No | `plrd.goatcounter.com`, always on |

GA4 is added via [`@next/third-parties/google`](https://nextjs.org/docs/app/guides/third-party-libraries#google-analytics)
in `src/app/layout.tsx` and only loads when `NEXT_PUBLIC_GA_ID` is set. It
auto-tracks client-side route changes (SPA), outbound clicks, scroll depth, and
file downloads via GA4 Enhanced Measurement.

## Where to see "how did people find us"

GA4 → **Reports → Acquisition → Traffic acquisition**, then set the primary
dimension to **Session default channel group** (or **Session source / medium**):

- **Organic Search** — Google etc. (richer once Search Console is linked)
- **Direct** — typed URL / bookmarks
- **Referral** — other sites linking us
- **Organic Social** — Twitter/X, LinkedIn… ← where our UTM'd social links land
- **Email** — the newsletter

For per-post breakdowns, filter by **Session campaign** (our `utm_campaign`).

## UTM tagging — the rules

UTMs are query parameters appended to a link. GA4 reads them to attribute the
visit. **Only tag external links that point *to* the site** (social posts,
newsletters). Never UTM internal navigation.

| Param | Meaning | Allowed values (keep it to these) |
|---|---|---|
| `utm_source` | *where* it's posted | `twitter`, `linkedin`, `bluesky`, `mastodon`, `newsletter`, `farcaster`, `reddit`, `hn` |
| `utm_medium` | *type* of channel | `social` (any social post), `email` (newsletter), `referral` (partner link) |
| `utm_campaign` | the post/campaign | the post **slug**, e.g. `human-connectome` |
| `utm_content` | *optional* variant/placement | `thread-1`, `bio-link`, `pinned` |

### Hard rules (so data doesn't fragment)

1. **Lowercase, hyphens, no spaces.** `twitter` ≠ `Twitter` ≠ `Twitter ` in GA4.
2. **`utm_medium=social` for all organic social**, `utm_medium=email` for the
   newsletter. GA4's channel grouping keys off `medium` — get this wrong and the
   traffic falls into "Unassigned".
3. **Same `utm_campaign` across every channel for one post.** Use the post slug.
   This lets us compare Twitter vs LinkedIn vs email for the *same* piece.
4. **Don't tag internal links.** UTMs on same-site links restart the session and
   corrupt attribution.
5. **Log every link** you create in the campaign tracker (see below) so the team
   reuses the exact same strings.

### Naming template

```
utm_source = <platform>
utm_medium = social | email | referral
utm_campaign = <post-slug>
utm_content = <optional-variant>
```

### Worked example

Post: `https://www.plrd.org/insights/human-connectome/`

```
# X / Twitter
https://www.plrd.org/insights/human-connectome/?utm_source=twitter&utm_medium=social&utm_campaign=human-connectome

# LinkedIn
https://www.plrd.org/insights/human-connectome/?utm_source=linkedin&utm_medium=social&utm_campaign=human-connectome

# Newsletter
https://www.plrd.org/insights/human-connectome/?utm_source=newsletter&utm_medium=email&utm_campaign=human-connectome
```

Build links with Google's free
[Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/) to avoid
syntax typos, or copy the template above.

## Campaign tracker

Keep one source of truth for every tagged link (a shared sheet is fine). Suggested
columns:

| Date | Post slug | Channel (source) | Medium | Campaign | utm_content | Final URL |
|---|---|---|---|---|---|---|

One row per link. This is what keeps `utm_source`/`utm_campaign` strings identical
across the team.

## Per-post checklist (when publishing)

- [ ] Note the post **slug** — this is the `utm_campaign` for the whole push.
- [ ] Build a tagged URL for **each** channel you'll post to (`social` / `email`).
- [ ] Add each link + strings to the campaign tracker.
- [ ] After a few days: GA4 → Traffic acquisition → filter **Session campaign** =
      the slug, to see which channel drove the most engaged traffic.

## Maintainer notes (one-time GA4 setup)

- **Data retention:** Admin → Data retention → **14 months** (default 2 months is
  too short; not retroactive).
- **Internal traffic filter:** define internal IPs + set the Data filter to
  **Active** so team/dev traffic is excluded.
- **Link Search Console:** Admin → Product links → Search Console (unlocks organic
  search queries).
- **Google Signals:** left **off** for now given the cookie-consent posture.

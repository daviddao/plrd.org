import type { CSSProperties } from 'react'
import Link from 'next/link'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import { publications, talks, blogPosts } from '@/lib/content'
import { AreaIcon } from '@/components/AreaIcons'
import MarkdownContent from '@/components/MarkdownContent'
import { fetchPage, getSection } from "@/lib/indexer"
import { FOCUS_AREA_DESCRIPTIONS } from '@/lib/focus-area-descriptions'
import { loadHexMosaic, type HexPattern } from "@/lib/hex-mosaic"
import RDPipeline from "@/components/RDPipeline"
import InsightCarousel from "@/components/InsightCarousel"

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
  slug: string
  areas: string[]
  coverImage?: string
}

/**
 * Extract YouTube video ID from Hugo shortcode in HTML.
 * Handles both raw `{{< youtube ID >}}` and HTML-encoded `{{&#x3C; youtube ID >}}`
 */
function extractYouTubeId(html: string): string | null {
  // Match patterns like {{< youtube VIDEO_ID >}} or {{&#x3C; youtube VIDEO_ID >}}
  const patterns = [
    /\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/,
    /\{\{&#x3C;\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Generate YouTube thumbnail URL from video ID.
 * Uses maxresdefault for best quality, falls back to hqdefault.
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

function getLatestUpdates(count: number): UpdateItem[] {
  const pubs = publications.map((p) => ({
    title: p.title || p.slug,
    date: p.date || '',
    type: 'Publication',
    permalink: `/publications/${p.slug}`,
    slug: p.slug,
    areas: p.areas || [],
  }))

  const talkItems = talks.map((t) => {
    const youtubeId = extractYouTubeId(t.html || '')
    return {
      title: t.title || t.slug,
      date: t.date || '',
      type: 'Talk',
      permalink: `/talks/${t.slug}`,
      slug: t.slug,
      areas: (t.areas || []).filter(Boolean) as string[],
      coverImage: youtubeId ? getYouTubeThumbnail(youtubeId) : undefined,
    }
  })

  const blogItems = blogPosts.map((b) => ({
    title: b.title || b.slug,
    date: b.date || '',
    type: 'Blog',
    permalink: b.external_url || `/blog/${b.slug}`,
    slug: b.slug,
    areas: [],
    coverImage: b.coverImage || '',
  }))

  return [...pubs, ...talkItems, ...blogItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}


export default async function HomePage() {
  const updates = getLatestUpdates(8)

  const page = await fetchPage("landing")
  const hero = getSection(page, "hero")
  const approach = getSection(page, "approach")
  const dhr = getSection(page, "approach-dhr")
  const eg = getSection(page, "approach-eg")
  const ai = getSection(page, "approach-ai")
  const neuro = getSection(page, "approach-neuro")
  const team = getSection(page, "team")

  return (
    <>
    <div className="max-w-6xl mx-auto px-6">
      <div className="pt-6 empty:hidden">
        <PageEditHistoryByline rkey="landing" />
      </div>

      {/* ── Hero ── */}
      <div className="relative pt-16 pb-8 md:pt-20 md:pb-10 lg:pt-24 lg:pb-12 overflow-visible">
        {/* Hero image - positioned absolutely to sit "under" the headline */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[280px] sm:w-[360px] md:w-[450px] lg:w-[520px] xl:w-[560px] pointer-events-none select-none"
          style={{ zIndex: 0 }}
        >
          <img
            src="/images/hero.webp"
            alt="Glass cube containing colorful neural structures"
            className="w-full h-auto"
          />
        </div>

        <div className="relative z-10">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-medium">
            Protocol Labs Research &amp; Development
          </p>
          <h1 className="font-serif text-[36px] md:text-[48px] lg:text-[52px] font-normal leading-[1.06] tracking-tight mb-6 max-w-md md:max-w-lg lg:max-w-xl">
            Driving R&amp;D breakthroughs to push humanity forward.
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-semibold text-[15px]"
            >
              About us
              <span>→</span>
            </Link>
            <a
              href="#focus-areas"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-[15px]"
            >
              Focus areas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

        <a
          href="#focus-areas"
          className="relative z-10 inline-flex flex-col items-center gap-1.5 mt-12 text-gray-400 hover:text-gray-600 transition-colors group"
        >
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>

    </div>

    {/* ── Focus Areas (full-bleed gray) ── */}
    <div id="focus-areas" className="bg-gray-100 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 pb-20 lg:pb-28 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-44 sm:mb-48 lg:mb-52">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-[1.1] tracking-tight">
            {approach?.title || "Use-inspired research across four frontiers"}
          </h2>
          <MarkdownContent
            content="Our work is concentrated in areas where computing systems will shape human freedom, institutional capacity, machine intelligence, and the future of cognition itself."
            className="text-base text-gray-600 leading-relaxed lg:-mt-[3px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-44 md:gap-y-48 lg:gap-y-52">
          <FocusAreaCard
            href="/areas/digital-human-rights"
            iconType="shield"
            mosaicSlug="digital-human-rights"
            title={dhr?.title || "Digital Human Rights"}
            body={FOCUS_AREA_DESCRIPTIONS['digital-human-rights']}
          />
          <FocusAreaCard
            href="/areas/economies-governance"
            iconType="hexagon"
            mosaicSlug="economies-governance"
            title={eg?.title || "Economies & Governance"}
            body={FOCUS_AREA_DESCRIPTIONS['economies-governance']}
          />
          <FocusAreaCard
            href="/areas/ai-robotics"
            iconType="neural"
            mosaicSlug="ai-robotics"
            title={ai?.title || "AI & Robotics"}
            body={FOCUS_AREA_DESCRIPTIONS['ai-robotics']}
          />
          <FocusAreaCard
            href="/areas/neurotech"
            iconType="brain"
            mosaicSlug="neurotech"
            title={neuro?.title || "Neurotechnology"}
            body={FOCUS_AREA_DESCRIPTIONS.neurotech}
          />
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-6">
      {/* ── R&D Pipeline ── */}
      <div className="pb-16 lg:pb-20 border-t border-gray-200 pt-16 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-6 lg:mb-8">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-[1.1] tracking-tight">
            PL R&amp;D helps promising research cross the innovation chasm
          </h2>
          <p className="text-base text-gray-600 leading-relaxed lg:-mt-[3px]">
            Our R&amp;D pipeline accelerates frontier ideas from early research into production systems that scale globally. We help researchers, builders, funders, and institutions coordinate around the technical primitives, open infrastructure, and deployment pathways that make new fields real.
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <RDPipeline />
        </div>
      </div>

      {/* ── Latest Insights ── */}
      <div className="pb-12 lg:pb-14 pt-14 lg:pt-16">
        <div className="flex items-baseline justify-between mb-7">
          <div>
            <p className="text-sm text-blue font-medium mb-1">News &amp; Insights</p>
            <h2 className="text-[28px] md:text-[36px] font-normal leading-[1.1] tracking-tight">
              Latest from PL R&amp;D
            </h2>
          </div>
          <Link
            href="/insights/"
            className="text-sm text-blue font-semibold hover:underline transition-colors hidden sm:inline-flex items-center gap-1"
          >
            View all News &amp; Insights →
          </Link>
        </div>
        <InsightCarousel items={updates} />
      </div>

      {/* ── Team ── */}
      <div className="pb-12 lg:pb-14 border-t border-gray-200 pt-10 lg:pt-12">
        <h2 className="text-[13px] text-gray-500 uppercase tracking-[0.12em] font-bold mb-4">Team</h2>
        <MarkdownContent
          content={team?.body || "A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity."}
          className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-6"
        />
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-semibold text-sm"
        >
          Meet the team
          <span>→</span>
        </Link>
      </div>
      <EditPageButton rkey="landing" />
    </div>
    </>
  )
}

function FocusAreaCard({
  href,
  iconType,
  mosaicSlug,
  title,
  body,
}: {
  href: string
  iconType: HexPattern
  mosaicSlug: string
  title: string
  body: string
}) {
  const mosaic = loadHexMosaic(mosaicSlug, iconType)

  return (
    <div className="hex-cloud-card relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 -top-32 sm:-top-36 lg:-top-40 w-[65%] sm:w-[62%] lg:w-[60%] h-56 sm:h-64 lg:h-64 overflow-hidden select-none"
      >
        <svg
          viewBox={mosaic.viewBox}
          width={mosaic.width}
          height={mosaic.height}
          xmlns="http://www.w3.org/2000/svg"
          className="hex-cloud-svg absolute bottom-0 left-0 w-full h-auto"
          preserveAspectRatio="xMidYMax meet"
        >
          {mosaic.polygons.map((p, i) => (
            <polygon
              key={i}
              points={p.points}
              fill={p.fill}
              className="hex-cloud-hex"
              style={{ '--hex-op': p.opacity, animationDelay: `${p.delayMs}ms` } as CSSProperties}
            />
          ))}
        </svg>
      </div>

      <Link
        href={href}
        className="relative z-10 block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <AreaIcon type={iconType} className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-serif font-normal tracking-tight">{title}</h3>
        </div>
        <MarkdownContent
          content={body}
          className="text-[15px] text-gray-600 leading-relaxed [&_p]:mb-0"
        />
      </Link>
    </div>
  )
}

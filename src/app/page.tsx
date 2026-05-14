import Link from 'next/link'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import { publications, talks, blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { AreaIcon } from '@/components/AreaIcons'
import { GeoIllustration } from '@/components/GeoIllustration'
import MarkdownContent from '@/components/MarkdownContent'
import { fetchPage, getSection, getSectionsWithPrefix } from "@/lib/indexer"
import { FOCUS_AREA_DESCRIPTIONS } from '@/lib/focus-area-descriptions'
import { loadHexMosaic, type HexPattern } from "@/lib/hex-mosaic"
import RDPipeline from "@/components/RDPipeline"

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
  slug: string
  areas: string[]
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

  const talkItems = talks.map((t) => ({
    title: t.title || t.slug,
    date: t.date || '',
    type: 'Talk',
    permalink: `/talks/${t.slug}`,
    slug: t.slug,
    areas: (t.areas || []).filter(Boolean) as string[],
  }))

  const blogItems = blogPosts.map((b) => ({
    title: b.title || b.slug,
    date: b.date || '',
    type: 'Blog',
    permalink: b.external_url || `/blog/${b.slug}`,
    slug: b.slug,
    areas: [],
  }))

  return [...pubs, ...talkItems, ...blogItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

function CardIllustration({ slug, areas }: { slug: string; areas: string[] }) {
  return <GeoIllustration seed={slug} areas={areas} w={320} h={120} />
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
    <div className="max-w-6xl mx-auto px-6">
      {/* Admin-only edit-history byline. Renders nothing for non-admins —
          the `empty:hidden` variant collapses this wrapper entirely (incl.
          its `pt-6`) when the byline returns null, so the public landing
          page's hero sits flush against the navbar. */}
      <div className="pt-6 empty:hidden">
        <PageEditHistoryByline rkey="landing" />
      </div>
      {/* clipPath: keep the top hard-clipped at the hero's top edge so the
          painting starts cleanly below the navbar (no bleed-through behind
          the sticky white/95 navbar). Right side opens by 100vw so the
          image can extend to the screen edge past `max-w-6xl`. */}
      <div className="relative pt-20 pb-20 md:pt-32 md:pb-28 lg:pt-44 lg:pb-36" style={{ clipPath: 'inset(0 -100vw 0 0)' }}>
        {/* Hero banner image. `inset-y-0` (instead of the old
            `top-1/2 -translate-y-[60%] h-[140%]`) makes the image's
            display box exactly match the hero band's height — no extra
            offset, no upward overflow that gets clipped. With
            `backgroundSize: auto 100%` the painting fits this height
            exactly (full brain → city composition visible) and overflows
            horizontally; `right center` pins the right edge so the
            overflow lands on the LEFT and is softened by the left-fading
            mask. */}
        <div
          className="absolute inset-y-0 pointer-events-none select-none"
          style={{
            right: 'calc(-50vw + 50%)',
            width: '70vw',
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.35,
            maskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        {/* `max-w-lg` (32rem) is tight enough that at lg's 64px the h1
            wraps into the four-line cadence from the design ref:
            "Driving R&D / breakthroughs to / push humanity / forward."
            — "breakthroughs to" fits on a line, but "breakthroughs to push"
            doesn't, forcing the desired break. */}
        <h1 className="relative z-10 max-w-lg font-serif text-[36px] md:text-[52px] lg:text-[64px] font-normal leading-[1.1] tracking-tight mb-8">
          {hero?.title || "Driving R&D breakthroughs to push humanity forward."}
        </h1>
        <div className="relative z-10 flex flex-wrap gap-4">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            About us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          {/* In-page anchor: scrolls to the focus-areas section below
              instead of leaving the landing page. <a> (not next/link) so we
              don't get a router push for a same-page hash. */}
          <a
            href="#focus-areas"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
          >
            Focus areas
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
        <div className="relative z-10 mt-16 lg:mt-24">
          <svg className="w-6 h-6 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>

      {/* R&D pipeline — the canonical PL R&D 5-stage funnel shown as a
          hexagonal mosaic from blue (Research) → green (Scaling). Mirrors
          the focus-areas section directly below it: same 2-column heading +
          description grid, same vertical rhythm, same top border. The
          diagram is constrained to a sub-`max-w-6xl` column so it reads as
          a refined diagram rather than a hero banner. */}
      <div className="pb-16 lg:pb-20 border-t border-gray-200 pt-16 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-12 lg:mb-14">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight">
            From research to scale.
          </h2>
          <p className="text-base text-gray-600 leading-relaxed lg:pt-3">
            Our R&amp;D pipeline moves frontier ideas from open research
            through productionizing and into deployed systems that scale
            globally — each stage compounding on the last.
          </p>
        </div>
        {/* `max-w-5xl` (64rem ≈ 1024px) tames the diagram so it no longer
            dominates the page. `mx-auto` keeps it centered within the
            page's `max-w-6xl` content column. */}
        <div className="max-w-5xl mx-auto">
          <RDPipeline />
        </div>
      </div>

      {/* R&D approach section — four focus-area cards with hexagonal mosaic
          backdrops generated from each area's hero image. The mosaic floats
          above the card from the top-left, peeking out by ~96px so the card
          edge slices into the cluster of hexes — the mosaic reads as a
          "signal" rising out of the card. */}
      <div id="focus-areas" className="pb-20 lg:pb-28 border-t border-gray-200 pt-16 lg:pt-24 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-44 sm:mb-48 lg:mb-52">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight">
            {approach?.title || "Use-inspired research across four frontiers"}
          </h2>
          <MarkdownContent
            content={approach?.body || "We work in Pasteur's Quadrant — pursuing fundamental understanding while staying anchored to real-world impact. Our four focus areas span the most consequential frontiers in computing, society, and human cognition."}
            className="text-base text-gray-600 leading-relaxed lg:pt-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-44 md:gap-y-48 lg:gap-y-52">
          <FocusAreaCard
            href="/areas/digital-human-rights"
            iconType="shield"
            mosaicSlug="digital-human-rights"
            title={dhr?.title || "Digital Human Rights"}
            body={dhr?.subtitle || FOCUS_AREA_DESCRIPTIONS['digital-human-rights']}
          />
          <FocusAreaCard
            href="/areas/economies-governance"
            iconType="hexagon"
            mosaicSlug="economies-governance"
            title={eg?.title || "Economies & Governance"}
            body={eg?.subtitle || FOCUS_AREA_DESCRIPTIONS['economies-governance']}
          />
          <FocusAreaCard
            href="/areas/ai-robotics"
            iconType="neural"
            mosaicSlug="ai-robotics"
            title={ai?.title || "AI & Robotics"}
            body={ai?.subtitle || FOCUS_AREA_DESCRIPTIONS['ai-robotics']}
          />
          <FocusAreaCard
            href="/areas/neurotech"
            iconType="brain"
            mosaicSlug="neurotech"
            title={neuro?.title || "Neurotechnology"}
            body={neuro?.subtitle || FOCUS_AREA_DESCRIPTIONS.neurotech}
          />
        </div>
      </div>



      {/* Latest from PL R&D — horizontal scroll cards */}
      <div className="pb-20 lg:pb-28">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide">Latest insights from PL R&amp;D</h2>
          <div className="flex gap-4">
            <Link
              href="/publications"
              className="text-sm text-gray-400 hover:text-blue transition-colors"
            >
              Publications
            </Link>
            <Link
              href="/talks"
              className="text-sm text-gray-400 hover:text-blue transition-colors"
            >
              Talks
            </Link>
          </div>
        </div>
        {/* Scroll track — bleeds to the right edge of the viewport */}
        <div
          className="flex gap-5 overflow-x-auto pb-6 -mr-6"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {updates.map((item) => (
            <Link
              key={item.permalink}
              href={item.permalink}
              className="group flex-none w-[280px] md:w-[300px] flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue transition-all duration-200"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Illustration */}
              <div className="overflow-hidden">
                <CardIllustration slug={item.slug} areas={item.areas} />
              </div>
              {/* Content */}
              <div className="flex flex-col flex-1 justify-between p-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue/10 group-hover:text-blue transition-colors">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="text-sm font-medium text-black leading-snug group-hover:text-blue transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-blue transition-colors">
                  Read more
                  <svg className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
          {/* Trailing spacer so last card doesn't sit flush against viewport edge */}
          <div className="flex-none w-2" aria-hidden="true" />
        </div>
      </div>

      <div className="pb-20 lg:pb-28">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Team</h2>
        <MarkdownContent
          content={team?.body || "A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity."}
          className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-6"
        />
        <Link 
          href="/authors" 
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all font-medium"
        >
          Meet the team
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
      <EditPageButton rkey="landing" />
    </div>
  )
}

/**
 * One of the four focus-area cards on the landing page. The card itself
 * is a clean white panel; the hexagonal-mosaic backdrop floats above and
 * to the left, generated by `scripts/generate-hex-mosaics.mjs` from each
 * area's hero image. The card crops the bottom half of the cluster, so
 * the silhouette reads as a cloud of hexes rising out of the card edge.
 */
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
  // Parse the mosaic SVG once at module load and pre-compute per-hex animation
  // delays. The pattern (shield/hexagon/neural/brain) drives which wave shape
  // the hover ripple takes. See `src/lib/hex-mosaic.ts`.
  const mosaic = loadHexMosaic(mosaicSlug, iconType)

  return (
    // `isolate` scopes z-index to this card so the mosaic only stacks against
    // its own card edges, never bleeds across siblings. `hex-cloud-card` is
    // the hover hook — `:hover` here cascades into the inline mosaic SVG and
    // each polygon (see `globals.css`).
    <div className="hex-cloud-card relative isolate">
      {/*
        Hex mosaic band: anchored to the left edge of the card and ~65% as
        wide as the card. The band extends a few rems BELOW the card's top
        edge so the bottom of the cluster sits behind the card — the card's
        white panel slices through the cluster, which reads as the cloud
        "diving into" the card top (matches the design reference).
        `overflow-hidden` keeps the cluster from bleeding into adjacent rows
        or the section header. The SVG itself is inline (not an <img>) so we
        can target individual <polygon>s on hover.
      */}
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
              className="hex-cloud-hex"
              points={p.points}
              fill={p.fill}
              style={{
                // CSS custom prop carries the per-hex base opacity into the
                // keyframe so the cloud's edge falloff is preserved while the
                // hex pulses brighter on hover.
                ['--hex-op' as string]: p.opacity.toFixed(3),
                animationDelay: `${p.delayMs}ms`,
              }}
            />
          ))}
        </svg>
      </div>

      <Link
        href={href}
        className="relative z-10 flex items-start gap-5 p-6 lg:p-7 bg-white border border-gray-200 rounded-xl hover:border-blue hover:shadow-md transition-all group"
      >
        <AreaIcon type={iconType} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg lg:text-[22px] font-medium text-black group-hover:text-blue transition-colors leading-tight">
              {title}
            </h3>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-blue group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
          <MarkdownContent
            content={body}
            className="mt-2 text-sm lg:text-[15px] text-gray-500 leading-relaxed [&_p]:mb-0"
          />
        </div>
      </Link>
    </div>
  )
}

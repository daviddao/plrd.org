import Link from 'next/link'
import EditPageButton from '@/components/EditPageButton'
import { publications, talks, blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { AreaIcon } from '@/components/AreaIcons'
import { GeoIllustration } from '@/components/GeoIllustration'
import { fetchPage, getSection, getSectionsWithPrefix } from "@/lib/indexer"

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
      <div className="relative pt-20 pb-20 md:pt-32 md:pb-28 lg:pt-44 lg:pb-36" style={{ clipPath: 'inset(0 -100vw 0 0)' }}>
        {/* Hero banner image - extends to screen edge */}
        <div 
          className="absolute top-1/2 -translate-y-[60%] h-[140%] pointer-events-none select-none"
          style={{
            right: 'calc(-50vw + 50%)',
            width: '70vw',
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.35,
            maskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <h1 className="relative z-10 font-serif text-[36px] md:text-[52px] lg:text-[64px] font-normal leading-[1.1] tracking-tight mb-8">
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
          <Link 
            href="/areas" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
          >
            Focus areas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="relative z-10 mt-16 lg:mt-24">
          <svg className="w-6 h-6 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>

      {/* R&D approach section — four focus-area cards with hexagonal mosaic
          backdrops generated from each area's hero image. The mosaic floats
          above the card from the top-left, peeking out by ~96px so the card
          edge slices into the cluster of hexes — the mosaic reads as a
          "signal" rising out of the card. */}
      <div className="pb-20 lg:pb-28 border-t border-gray-200 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-36 sm:mb-40 lg:mb-44">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight">
            {approach?.title || "Use-inspired research across four frontiers"}
          </h2>
          <p className="text-base text-gray-600 leading-relaxed lg:pt-3">
            {approach?.body || "We work in Pasteur's Quadrant — pursuing fundamental understanding while staying anchored to real-world impact. Our four focus areas span the most consequential frontiers in computing, society, and human cognition."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-32 md:gap-y-36 lg:gap-y-40">
          <FocusAreaCard
            href="/areas/digital-human-rights"
            iconType="shield"
            mosaicSrc="/images/fa2/mosaics/digital-human-rights.svg"
            title={dhr?.title || "Digital Human Rights"}
            body={dhr?.subtitle || "Building decentralized infrastructure that enshrines freedom and safety in the digital age."}
          />
          <FocusAreaCard
            href="/areas/economies-governance"
            iconType="hexagon"
            mosaicSrc="/images/fa2/mosaics/economies-governance.svg"
            title={eg?.title || "Economies & Governance"}
            body={eg?.subtitle || "Crypto-native tools for more efficient, equitable coordination at global scale."}
          />
          <FocusAreaCard
            href="/areas/ai-robotics"
            iconType="neural"
            mosaicSrc="/images/fa2/mosaics/ai-robotics.svg"
            title={ai?.title || "AI & Robotics"}
            body={ai?.subtitle || "Responsible advancement in AGI, robotics, and immersive technologies that reshape how we interact with the world."}
          />
          <FocusAreaCard
            href="/areas/neurotech"
            iconType="brain"
            mosaicSrc="/images/fa2/mosaics/neurotech.svg"
            title={neuro?.title || "Neurotechnology"}
            body={neuro?.subtitle || "Accelerating brain-computer interfaces and NeuroAI to expand human cognition and treat brain disorders."}
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
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-6">
          {team?.body || "A fully remote team distributed across the globe, working with talented and intellectually curious people who share a passion for improving technology for humanity."}
        </p>
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
  mosaicSrc,
  title,
  body,
}: {
  href: string
  iconType: 'shield' | 'hexagon' | 'neural' | 'brain'
  mosaicSrc: string
  title: string
  body: string
}) {
  return (
    // `isolate` scopes z-index to this card so the mosaic only stacks against
    // its own card edges, never bleeds across siblings.
    <div className="relative isolate">
      {/*
        Hex mosaic band: a fixed-height strip sitting directly on top of the
        card. `overflow-hidden` clips the mosaic so it can never escape this
        strip and invade the previous row, the section title, or other cards.
        The image is anchored to the bottom of the strip and grows to ~110%
        wide, so the cluster reads as if it's rising out from behind the
        card and being cropped by the card's top edge.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 -top-28 sm:-top-32 lg:-top-36 h-32 sm:h-36 lg:h-40 overflow-hidden select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mosaicSrc}
          alt=""
          className="absolute -left-[5%] -bottom-4 w-[110%] h-auto opacity-90"
          loading="lazy"
          decoding="async"
        />
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
          <p className="mt-2 text-sm lg:text-[15px] text-gray-500 leading-relaxed">
            {body}
          </p>
        </div>
      </Link>
    </div>
  )
}

import Link from 'next/link'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import { publications, talks, blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import MarkdownContent from '@/components/MarkdownContent'
import { fetchPage, getSection } from "@/lib/indexer"
import { FOCUS_AREA_DESCRIPTIONS } from '@/lib/focus-area-descriptions'
import RDPipeline from "@/components/RDPipeline"

const AREA_COLORS: Record<string, string> = {
  'digital-human-rights': '#1982F4',
  'economies-governance': '#12bfdf',
  'ai-robotics': '#3966FE',
  'neurotech': '#E51A66',
}

const AREA_IMAGES: Record<string, string> = {
  'digital-human-rights': 'https://images.unsplash.com/photo-1758876201450-cf77ab8b95bc?w=600&q=80',
  'economies-governance': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  'ai-robotics': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  'neurotech': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
}

const FOCUS_AREA_META: {
  slug: string
  href: string
  iconType: AreaIconType
  sectionKey: string
  descKey: keyof typeof FOCUS_AREA_DESCRIPTIONS
  opportunitySpaces: { id: string; label: string }[]
}[] = [
  {
    slug: 'digital-human-rights',
    href: '/areas/digital-human-rights',
    iconType: 'shield',
    sectionKey: 'approach-dhr',
    descKey: 'digital-human-rights',
    opportunitySpaces: [
      { id: 'censorship-resistant-communications', label: 'Censorship-Resistant Comms' },
      { id: 'portable-identity-credentials', label: 'Portable Identity' },
      { id: 'verifiable-public-knowledge', label: 'Verifiable Knowledge' },
      { id: 'sovereign-infrastructure-ai-agents', label: 'Sovereign AI Infra' },
    ],
  },
  {
    slug: 'economies-governance',
    href: '/areas/economies-governance',
    iconType: 'hexagon',
    sectionKey: 'approach-eg',
    descKey: 'economies-governance',
    opportunitySpaces: [
      { id: 'sovereign-dpi', label: 'Sovereign DPI' },
      { id: 'public-goods-funding', label: 'Public Goods Funding' },
      { id: 'governance-democracy', label: 'Governance & Democracy' },
      { id: 'climate-infrastructure', label: 'Climate Infrastructure' },
    ],
  },
  {
    slug: 'ai-robotics',
    href: '/areas/ai-robotics',
    iconType: 'neural',
    sectionKey: 'approach-ai',
    descKey: 'ai-robotics',
    opportunitySpaces: [
      { id: 'open-compute-networks', label: 'Open Compute' },
      { id: 'agent-coordination-infrastructure', label: 'Agent Coordination' },
      { id: 'embodied-ai-robotics-data', label: 'Embodied AI & Robotics' },
      { id: 'agent-native-economic-infrastructure', label: 'Agent Economics' },
    ],
  },
  {
    slug: 'neurotech',
    href: '/areas/neurotech',
    iconType: 'brain',
    sectionKey: 'approach-neuro',
    descKey: 'neurotech',
    opportunitySpaces: [
      { id: 'neural-augmentation', label: 'Neural Augmentation (BCI)' },
      { id: 'biologically-inspired-intelligence', label: 'NeuroAI' },
      { id: 'whole-organism-emulation', label: 'Whole Brain Emulation' },
    ],
  },
]

type UpdateItem = {
  title: string
  date: string
  type: string
  permalink: string
  slug: string
  areas: string[]
  /**
   * For blog posts, the cover image scraped from the external_url's
   * og:image at build time (see `scripts/build-content.mjs > buildBlog`).
   * Publications and talks leave this empty and fall back to the
   * procedural hex GeoIllustration.
   */
  coverImage?: string
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
    coverImage: b.coverImage || '',
  }))

  return [...pubs, ...talkItems, ...blogItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

function CardIllustration({
  slug,
  areas,
  coverImage,
  title,
}: {
  slug: string
  areas: string[]
  coverImage?: string
  title?: string
}) {
  // When the source provides a real cover image (currently: blog posts whose
  // og:image was scraped at build time), use it. Otherwise fall back to the
  // procedural hex illustration so publications/talks still get a visual.
  if (coverImage) {
    return (
      <img
        src={coverImage}
        alt={title || ''}
        width={320}
        height={120}
        loading="lazy"
        className="w-full h-[120px] object-cover bg-gray-50 group-hover:scale-[1.02] transition-transform duration-300"
      />
    )
  }
  return <GeoIllustration seed={slug} areas={areas} w={320} h={120} />
}


export default async function HomePage() {
  const updates = getLatestUpdates(8)

  const page = await fetchPage("landing")
  const hero = getSection(page, "hero")
  const approach = getSection(page, "approach")
  const team = getSection(page, "team")

  const focusAreaSections = Object.fromEntries(
    FOCUS_AREA_META.map((fa) => [fa.slug, getSection(page, fa.sectionKey)])
  )

  return (
    <>
    <div className="max-w-6xl mx-auto px-6">
      {/* Admin-only edit-history byline. Renders nothing for non-admins —
          the `empty:hidden` variant collapses this wrapper entirely (incl.
          its `pt-6`) when the byline returns null, so the public landing
          page's hero sits flush against the navbar. */}
      <div className="pt-6 empty:hidden">
        <PageEditHistoryByline rkey="landing" />
      </div>
      {/* ── Hero ── */}
      <div className="relative pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
        <img
          src="/images/hero-prism.png"
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-auto pointer-events-none select-none"
        />
        <div className="relative z-10">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-medium">
            Protocol Labs Research &amp; Development
          </p>
          <h1 className="max-w-[13ch] font-serif text-[36px] md:text-[48px] lg:text-[62px] font-normal leading-[1.06] tracking-tight mb-6">
            {hero?.title || "Driving R&D breakthroughs to push humanity forward."}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mb-8">
            We drive breakthroughs in computing to expand human freedom,
            coordination, intelligence, and cognition — moving frontier ideas
            from open research to deployed systems that scale globally.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white rounded-full hover:opacity-90 transition-opacity font-semibold text-[15px]"
            >
              Explore focus areas
              <span className="text-[15px]">→</span>
            </Link>
            <Link
              href="/outreach/collaboration/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-semibold text-[15px]"
            >
              Partner with us
            </Link>
          </div>
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

    </div>

    {/* ── Focus Areas (full-bleed gray) ── */}
    <div id="focus-areas" className="bg-gray-100 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-14 lg:mb-12">
          <h2 className="text-[28px] md:text-[36px] font-normal leading-tight tracking-tight">
            {approach?.title || "Use-inspired research across four frontiers"}
          </h2>
          <MarkdownContent
            content="PL R&D drives breakthroughs in computing to expand human freedom, coordination, intelligence, and cognition. We help researchers, builders, funders, and institutions coordinate around the technical primitives, open infrastructure, and deployment pathways that make new fields real."
            className="text-base text-gray-600 leading-relaxed lg:pt-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FOCUS_AREA_META.map((fa) => {
            const section = focusAreaSections[fa.slug]
            return (
              <FocusAreaCard
                key={fa.slug}
                href={fa.href}
                iconType={fa.iconType}
                title={section?.title || fa.slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                body={section?.subtitle || FOCUS_AREA_DESCRIPTIONS[fa.descKey]}
                opportunitySpaces={fa.opportunitySpaces}
                areaSlug={fa.slug}
                color={AREA_COLORS[fa.slug]}
                image={AREA_IMAGES[fa.slug]}
              />
            )
          })}
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-6">



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
                <CardIllustration
                  slug={item.slug}
                  areas={item.areas}
                  coverImage={item.coverImage}
                  title={item.title}
                />
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
    </>
  )
}

function FocusAreaCard({
  href,
  iconType,
  title,
  body,
  opportunitySpaces,
  areaSlug,
  color,
  image,
}: {
  href: string
  iconType: AreaIconType
  title: string
  body: string
  opportunitySpaces: { id: string; label: string }[]
  areaSlug: string
  color: string
  image: string
}) {
  return (
    <div className="group border border-gray-200 rounded-2xl bg-white overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5">
      <div className="grid grid-cols-[150px_1fr] max-[520px]:grid-cols-1 max-[860px]:grid-cols-[96px_1fr]">
        <div
          className="bg-gray-100 bg-cover bg-center max-[520px]:h-[120px]"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="p-4 lg:p-5">
          <Link href={href} className="block">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span
                className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                <AreaIcon type={iconType} className="w-[17px] h-[17px]" />
              </span>
              <h3 className="text-[22px] font-serif font-normal leading-tight tracking-tight">
                {title}
              </h3>
            </div>
            <MarkdownContent
              content={body}
              className="text-[14.5px] text-gray-600 leading-relaxed mb-2.5 [&_p]:mb-0"
            />
          </Link>

          {opportunitySpaces.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em] font-bold mb-1.5">Opportunity spaces</p>
              <div>
                {opportunitySpaces.map((os) => (
                  <Link
                    key={os.id}
                    href={`/areas/${areaSlug}/opportunity-spaces/${os.id}/`}
                    className="flex items-center gap-2 text-[13.5px] text-almost-black py-1 border-t border-gray-100 first:border-t-0 hover:text-blue transition-colors"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {os.label}
                    <span className="ml-auto text-[13px] text-gray-300 group-hover:text-blue transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

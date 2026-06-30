import { blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import Breadcrumb from '@/components/Breadcrumb'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import MarkdownContent from '@/components/MarkdownContent'
import { ContentTile, ContentTileGrid } from '@/components/ContentTile'
import { fetchAtproPosts, fetchPage, getSection } from '@/lib/indexer'

const FALLBACK_HERO_TITLE = 'Blog'
const FALLBACK_HERO_SUBTITLE =
  'Updates, insights, and reflections from the PL R&D team.'

export default async function BlogPage() {
  const [atprotoPosts, page] = await Promise.all([
    fetchAtproPosts(),
    fetchPage('blog'),
  ])
  const hero = getSection(page, 'hero')
  const heroTitle = hero?.title || FALLBACK_HERO_TITLE
  const heroSubtitle = hero?.subtitle || FALLBACK_HERO_SUBTITLE

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Blog' }]} />
      <div className="mt-4 empty:hidden">
        <PageEditHistoryByline rkey="blog" />
      </div>
      {/* Hero */}
      <div className="relative pt-6 pb-10 mb-10 overflow-hidden">
        <PageGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          {heroTitle}
        </h1>
        <MarkdownContent content={heroSubtitle} className="relative z-10 text-gray-600 leading-relaxed max-w-xl" />
      </div>

      {/* Blog posts */}
      {blogPosts.length > 0 && (
        <ContentTileGrid>
          {blogPosts.map((post) => {
            const href = post.external_url || `/blog/${post.slug}/`
            const isExternal = !!post.external_url
            return (
              <ContentTile
                key={post.slug}
                href={href}
                external={isExternal}
                eyebrow={[isExternal ? 'protocol.ai' : 'PL R&D', formatDate(post.date)].filter(Boolean).join(' · ')}
                title={post.title}
                description={post.summary}
              />
            )
          })}
        </ContentTileGrid>
      )}

      {atprotoPosts.length > 0 && (
        <div className="mt-5">
          <ContentTileGrid>
            {atprotoPosts.map((post) => {
              const href = post.path || `/blog/${post.rkey}`
              const tag = post.tags?.find(t => t !== "blog") || "blog"
              return (
                <ContentTile
                  key={post.rkey}
                  href={href}
                  eyebrow={['PL R&D', formatDate(post.publishedAt), tag !== "blog" ? tag : '']
                    .filter(Boolean)
                    .join(' · ')}
                  title={post.title}
                  description={post.description ?? undefined}
                />
              )
            })}
          </ContentTileGrid>
        </div>
      )}
      <EditPageButton rkey="blog" />
    </div>
  )
}

function PageGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <path d="M 380 120 Q 480 100 580 130 Q 640 150 680 140" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 360 200 Q 460 180 560 210 Q 640 230 700 215" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 390 280 Q 490 260 590 290 Q 650 305 700 295" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 370 360 Q 470 340 570 370 Q 640 385 690 375" stroke="#C3E1FF" strokeWidth="0.75" />
      <path d="M 400 440 Q 500 420 580 445" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="380" cy="120" r="3" fill="#C3E1FF" />
      <circle cx="360" cy="200" r="3" fill="#C3E1FF" />
      <circle cx="390" cy="280" r="3" fill="#C3E1FF" />
      <circle cx="370" cy="360" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="440" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="130" r="2" fill="#C3E1FF" />
      <circle cx="560" cy="210" r="2" fill="#C3E1FF" />
      <circle cx="590" cy="290" r="2" fill="#C3E1FF" />
    </svg>
  )
}

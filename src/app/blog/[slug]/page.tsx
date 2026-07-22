import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'
import Fa2LiveDashboardEmbed from '@/components/Fa2LiveDashboardEmbed'

type Props = { params: Promise<{ slug: string }> }

// Marker a post can drop into its body to pull the live FA2 impact dashboard
// inline at that exact spot. The build passes raw HTML through untouched, so
// the empty div survives and we split on it here.
const FA2_DASHBOARD_MARKER = '<div id="fa2-live-dashboard"></div>'

// Refresh embedded live data on the same 60s window as the standalone
// dashboard page. Harmless for static posts (they just re-render).
export const revalidate = 60

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return { title: 'Not Found' }
  // External stubs live on their original home — point search engines there.
  const canonical = post.external_url || `/blog/${post.slug}/`
  const metaDescription = post.description || post.summary
  return {
    title: post.title,
    description: metaDescription,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: metaDescription,
      publishedTime: post.date || undefined,
      authors: post.authors,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Blog', href: '/blog/' }, { label: post.title }]} />
      <div className="mt-6 mb-2 text-sm text-gray-500">
        {formatDate(post.date)}
      </div>
      <h1 className="text-lg md:text-[32px] mb-6 leading-tight font-semibold max-w-3xl">
        {post.title}
      </h1>
      {post.authors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.authors.map((authorSlug) => (
            <AuthorCard key={authorSlug} slug={authorSlug} />
          ))}
        </div>
      )}
      {post.html && renderBody(post.html)}
    </div>
  )
}

// Render the post body, splicing the live dashboard in at the marker if present.
function renderBody(html: string) {
  const cls =
    'page-content text-base text-gray-700 leading-relaxed max-w-3xl'
  if (!html.includes(FA2_DASHBOARD_MARKER)) {
    return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />
  }
  const [before, after] = html.split(FA2_DASHBOARD_MARKER)
  return (
    <div className={cls}>
      <div dangerouslySetInnerHTML={{ __html: before }} />
      {/* Collapsed by default — the full dashboard is tall, so it's opt-in. */}
      <details className="fa2-dashboard">
        <summary>
          <svg
            className="fa2-chev"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            Live impact dashboard{' '}
            <span className="fa2-sub">— network metrics, maps &amp; trends</span>
          </span>
          <span className="fa2-cta">Show</span>
        </summary>
        <div className="fa2-body">
          <Fa2LiveDashboardEmbed />
        </div>
      </details>
      <div dangerouslySetInnerHTML={{ __html: after }} />
    </div>
  )
}

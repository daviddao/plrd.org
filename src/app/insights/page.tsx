import type { Metadata } from 'next'
import Link from 'next/link'
import { sections, publications, talks, tutorials, blogPosts } from '@/lib/content'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = { title: 'Insights' }

export default function InsightsPage() {
  const recentPubs = publications.slice(0, 10)
  const recentPosts = blogPosts.slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Insights' }]} />
      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        <PageGeo />
        <h1 className="relative z-10 text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-xl">
          Insights
        </h1>
        <p className="relative z-10 text-lg text-gray-600 leading-relaxed max-w-2xl">
          Exploring the frontiers of computing, networking, and knowledge systems to build infrastructure that empowers humanity.
        </p>
      </div>

      {/* Subpages */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard
            href="/publications"
            title="Publications"
            description="Papers and articles advancing the frontiers of decentralized systems, cryptography, and more."
            count={publications.length}
          />
          <InsightCard
            href="/talks"
            title="Talks"
            description="Presentations and lectures from conferences and events around the world."
            count={talks.length}
          />
          <InsightCard
            href="/tutorials"
            title="Tutorials"
            description="In-depth guides and educational materials on core research topics."
            count={tutorials.length}
          />
        </div>
      </div>

      {/* Section content if any */}
      {sections.research?.html && (
        <div className="mb-12 pb-12 border-b border-gray-100">
          <div className="page-content text-base text-gray-700 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: sections.research.html }} />
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="mb-12 pb-12 border-b border-gray-100">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">From the Blog</h2>
          <div className="divide-y divide-gray-100">
            {recentPosts.map((post) => {
              const href = post.external_url || `/blog/${post.slug}/`
              const isExternal = !!post.external_url
              return (
                <div key={post.slug} className="py-4">
                  <Link
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="text-base text-black hover:text-blue transition-colors"
                  >
                    {post.title}
                    {isExternal && <span className="text-gray-400 text-xs ml-1.5">↗</span>}
                  </Link>
                  {post.summary && (
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">{post.summary}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {post.date && new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isExternal && <span className="ml-2">· protocol.ai</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/blog" className="text-sm text-blue hover:underline mt-6 inline-block">
            All posts →
          </Link>
        </div>
      )}

      {/* Recent Publications */}
      {recentPubs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-8">Recent Publications</h2>
          <div className="divide-y divide-gray-100">
            {recentPubs.map((p) => (
              <div key={p.slug} className="py-4">
                <Link href={`/publications/${p.slug}`} className="text-base text-black hover:text-blue transition-colors">
                  {p.title}
                </Link>
                <div className="text-sm text-gray-400 mt-1">
                  {p.venue}{p.date && ` · ${new Date(p.date).getFullYear()}`}
                </div>
              </div>
            ))}
          </div>
          <Link href="/publications" className="text-base text-blue hover:underline mt-6 inline-block">
            All publications →
          </Link>
        </div>
      )}
    </div>
  )
}

function InsightCard({ href, title, description, count }: { href: string; title: string; description: string; count: number }) {
  return (
    <Link href={href} className="border border-gray-300 p-8 hover:border-blue hover:shadow-sm transition-all block">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-base text-gray-700 mb-4">{description}</p>
      <span className="text-sm text-gray-400">{count} entries</span>
    </Link>
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
      <polygon points="480,80 580,250 380,250" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="520,180 620,350 420,350" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="450,260 550,430 350,430" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="480" y1="80" x2="520" y2="180" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="250" x2="620" y2="350" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="350" x2="450" y2="260" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="80" r="3" fill="#C3E1FF" />
      <circle cx="520" cy="180" r="3" fill="#C3E1FF" />
      <circle cx="450" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="250" r="3" fill="#C3E1FF" />
      <circle cx="620" cy="350" r="3" fill="#C3E1FF" />
    </svg>
  )
}

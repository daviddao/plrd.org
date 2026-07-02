import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return { title: 'Not Found' }
  // External stubs live on their original home — point search engines there.
  const canonical = post.external_url || `/blog/${post.slug}/`
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: post.summary,
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
      <h1 className="text-lg md:text-[32px] mb-6 leading-tight font-semibold">
        {post.title}
      </h1>
      {post.authors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.authors.map((authorSlug) => (
            <AuthorCard key={authorSlug} slug={authorSlug} />
          ))}
        </div>
      )}
      {post.html && (
        <div className="page-content text-base text-gray-700 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: post.html }} />
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publications } from '@/lib/content'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pub = publications.find((p) => p.slug === slug)
  if (!pub) return { title: 'Not Found' }
  const description = (pub.abstract || '').slice(0, 160)
  const canonical = `/publications/${pub.slug}/`
  return {
    title: pub.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: pub.title,
      description,
      publishedTime: pub.date || undefined,
      authors: pub.authors,
    },
  }
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params
  const pub = publications.find((p) => p.slug === slug)
  if (!pub) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: pub.title,
    abstract: pub.abstract || undefined,
    datePublished: pub.date || undefined,
    author: (pub.authors || []).map((name) => ({ '@type': 'Person', name })),
    publisher: { '@type': 'Organization', name: 'Protocol Labs R&D' },
    ...(pub.venue ? { isPartOf: { '@type': 'Periodical', name: pub.venue } } : {}),
    ...(pub.doi ? { sameAs: `https://doi.org/${pub.doi}` } : {}),
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: 'Publications', href: '/publications/' }, { label: pub.title }]} />
      <div className="mb-2 text-sm text-gray-500 mt-6">
        {pub.date && <span>{new Date(pub.date).getFullYear()}</span>}
        {pub.venue && <> &middot; {pub.venue}</>}
      </div>
      <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold">{pub.title}</h1>
      {pub.authors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {pub.authors.map((authorSlug) => (
            <AuthorCard key={authorSlug} slug={authorSlug} />
          ))}
        </div>
      )}
      {pub.abstract && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{pub.abstract}</p>
        </div>
      )}
      {pub.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: pub.html }} />}
      <div className="mt-6 flex gap-4">
        {pub.url_pdf && <a href={pub.url_pdf} className="text-blue hover:underline text-sm">PDF</a>}
        {pub.url_source && <a href={pub.url_source} className="text-blue hover:underline text-sm">Source</a>}
        {pub.doi && <a href={`https://doi.org/${pub.doi}`} className="text-blue hover:underline text-sm">DOI</a>}
      </div>
    </div>
  )
}

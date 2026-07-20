import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tutorials } from '@/lib/content'
import Breadcrumb from '@/components/Breadcrumb'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return tutorials.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tutorial = tutorials.find((t) => t.slug === slug)
  if (!tutorial) return { title: 'Not Found' }
  const canonical = `/tutorials/${tutorial.slug}/`
  return {
    title: tutorial.title || slug,
    description: tutorial.summary || undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: tutorial.title || slug,
      description: tutorial.summary || undefined,
      publishedTime: tutorial.date || undefined,
    },
  }
}

export default async function TutorialPage({ params }: Props) {
  const { slug } = await params
  const tutorial = tutorials.find((t) => t.slug === slug)
  if (!tutorial) notFound()

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Tutorials', href: '/tutorials/' }, { label: tutorial.title || slug }]} />
      <h1 className="text-lg md:text-larger mb-4 leading-tight font-semibold mt-6">{tutorial.title || slug}</h1>
      {tutorial.html && <div className="page-content" dangerouslySetInnerHTML={{ __html: tutorial.html }} />}
    </div>
  )
}

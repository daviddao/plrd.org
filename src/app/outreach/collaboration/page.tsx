import type { Metadata } from 'next'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import Breadcrumb from '@/components/Breadcrumb'
import { fetchPage, getSection } from '@/lib/indexer'

export const metadata: Metadata = {
  title: 'Collaborate',
  description: 'Partner with PL R&D to advance the frontiers of computing and build infrastructure for humanity.',
}

export default async function CollaborationPage() {
  const page = await fetchPage("collaborate")
  const heroSection = getSection(page, "hero")
  const bodySection = getSection(page, "body")

  const heroTitle = heroSection?.title || "Collaborate With Us"
  const heroBody = heroSection?.subtitle || "We believe in open collaboration. Whether you're a researcher, developer, institution, or visionary builder, there are many ways to work together on problems that matter."
  const bodyParagraphs = bodySection?.body
    ? bodySection.body.split("\n\n").filter(Boolean)
    : [
        "PL R&D works at the intersection of fundamental research and real-world impact. We're building the infrastructure for a better internet and exploring how technology can help humanity flourish.",
        "Our collaborative approach brings together researchers, engineers, and institutions worldwide. We're always looking for partners who share our vision of open, decentralized, and human-centric technology.",
      ]

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Collaborate' }]} />
      <div className="mt-4">
        <PageEditHistoryByline rkey="collaborate" />
      </div>
      {/* Hero */}
      <div className="relative pt-6 pb-10 mb-10 overflow-hidden">
        <CollabGeo />

        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          {heroTitle}
        </h1>
        <p className="relative z-10 text-gray-600 leading-relaxed max-w-xl">
          {heroBody}
        </p>
      </div>

      {/* Content */}
      <div className="mb-10 pb-10 border-b border-gray-100">
        {bodyParagraphs.map((para, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed mb-4">
            {para}
          </p>
        ))}
      </div>

      {/* CTA */}
      <div>
        <p className="text-sm text-gray-500 mb-4">Ready to start a conversation?</p>
        <a
          href="mailto:research@protocol.ai"
          className="inline-flex items-center gap-2 text-sm text-blue hover:text-black border border-blue/30 hover:border-black/30 px-4 py-2 rounded-full transition-colors"
        >
          Contact us
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </a>
      </div>
      <EditPageButton rkey="collaborate" />
    </div>
  )
}

function CollabGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="400" cy="180" r="60" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="560" cy="180" r="60" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="480" cy="280" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="380" cy="360" r="40" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="580" cy="360" r="40" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="400" y1="180" x2="560" y2="180" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="400" y1="240" x2="480" y2="230" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="560" y1="240" x2="480" y2="230" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="480" y1="330" x2="380" y2="360" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="480" y1="330" x2="580" y2="360" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="380" y1="360" x2="580" y2="360" stroke="#C3E1FF" strokeWidth="0.5" strokeDasharray="4 4" />
      <circle cx="400" cy="180" r="4" fill="#C3E1FF" />
      <circle cx="560" cy="180" r="4" fill="#C3E1FF" />
      <circle cx="480" cy="280" r="3" fill="#C3E1FF" />
      <circle cx="380" cy="360" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="360" r="3" fill="#C3E1FF" />
    </svg>
  )
}

import type { Metadata } from 'next'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import Breadcrumb from '@/components/Breadcrumb'
import MarkdownContent from '@/components/MarkdownContent'
import { fetchPage, getSection } from '@/lib/indexer'

export const metadata: Metadata = {
  title: 'Collaborate',
  description: 'Partner with PL R&D to advance the frontiers of computing and build infrastructure for humanity.',
}

const HERO_TITLE_FALLBACK = 'Collaborate With Us'
const HERO_BODY_FALLBACK =
  "We believe in open collaboration. Whether you're a researcher, developer, institution, or visionary builder, there are many ways to work together on problems that matter."

const SECTION_TITLE_FALLBACK =
  'In addition to driving projects directly, we support and partner with the wider research community.'
const SECTION_BODY_FALLBACK =
  "Some of this support takes the form of grants and prizes for academic and independent research aligned with our focus areas. Other support comes through conference and event sponsorships — often including free, high-quality recordings of talks so the work reaches everyone, not just attendees.\n\nWe also partner directly with teams building open, decentralized, and human-centric technology: co-developing primitives, seeding new ventures, and helping promising research cross from the lab into deployment. If that sounds like your work, we'd love to hear from you."

export default async function CollaborationPage() {
  const page = await fetchPage('collaborate')
  const heroSection = getSection(page, 'hero')
  const bodySection = getSection(page, 'body')

  const heroTitle = heroSection?.title || HERO_TITLE_FALLBACK
  const heroBody = heroSection?.subtitle || HERO_BODY_FALLBACK
  const sectionTitle = bodySection?.title || SECTION_TITLE_FALLBACK
  const bodyContent = bodySection?.body || SECTION_BODY_FALLBACK

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Collaborate' }]} />
      <div className="mt-4 empty:hidden">
        <PageEditHistoryByline rkey="collaborate" />
      </div>

      {/* Hero */}
      <div className="relative pt-6 pb-10 mb-14 overflow-hidden">
        <CollabGeo />
        <h1 className="relative z-10 text-xl lg:text-[40px] font-semibold leading-[1.15] tracking-tight mb-4 max-w-lg">
          {heroTitle}
        </h1>
        <MarkdownContent content={heroBody} className="relative z-10 text-gray-600 leading-relaxed max-w-xl" />
      </div>

      {/* Collaborations and Support (mirrors the About page section) */}
      <div className="mb-14">
        <p className="text-blue text-sm tracking-wide mb-3">COLLABORATIONS AND SUPPORT</p>
        <h2 className="font-semibold text-xl lg:text-2xl leading-relaxed mb-8 max-w-3xl">{sectionTitle}</h2>
        <MarkdownContent
          content={bodyContent}
          className="page-content text-base text-gray-700 leading-relaxed lg:columns-2 lg:gap-14"
        />
      </div>

      {/* CTA: get in touch + follow on X */}
      <div className="border-t border-gray-200 pt-10">
        <p className="text-sm text-gray-500 mb-4">Ready to start a conversation?</p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:research@protocol.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-semibold text-sm"
          >
            Contact us
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </a>
          <a
            href="https://x.com/PL_RnD"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-800 rounded-full hover:border-black hover:text-black transition-colors font-semibold text-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow us on X
          </a>
        </div>
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

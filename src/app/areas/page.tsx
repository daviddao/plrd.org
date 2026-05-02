import type { Metadata } from 'next'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import Link from 'next/link'
import { areas } from '@/lib/content'
import { stripFaPrefix } from '@/lib/format'
import { AreaIcon, type AreaIconType } from '@/components/AreaIcons'
import Breadcrumb from '@/components/Breadcrumb'
import { fetchPage, getSection } from '@/lib/indexer'

export const metadata: Metadata = { title: 'Focus Areas' }

const AREA_ORDER = ['digital-human-rights', 'economies-governance', 'ai-robotics', 'neurotech']

const AREA_ICONS: Record<string, AreaIconType> = {
  'digital-human-rights': 'shield',
  'economies-governance': 'hexagon',
  'ai-robotics': 'neural',
  'neurotech': 'brain',
}

export default async function AreasPage() {
  const page = await fetchPage("areas")
  const heroSection = getSection(page, "hero")
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Focus Areas' }]} />
      <div className="mt-4 empty:hidden">
        <PageEditHistoryByline rkey="areas" />
      </div>
      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        <AreasGeo />
        <h1 className="relative z-10 text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight mb-5 max-w-xl">
          Focus Areas
        </h1>
        <p className="relative z-10 text-lg text-gray-600 leading-relaxed max-w-2xl">
          {heroSection?.subtitle || "Four research directions driving breakthroughs in computing, coordination, and human capability."}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
        {[...areas].sort((a, b) => AREA_ORDER.indexOf(a.slug) - AREA_ORDER.indexOf(b.slug)).map((area) => (
          <Link
            key={area.slug}
            href={`/areas/${area.slug}`}
            className="bg-white p-8 hover:bg-blue/[0.02] border border-transparent hover:border-blue/20 hover:shadow-lg transition-all duration-200 relative overflow-hidden group"
          >
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
              <AreaIcon type={AREA_ICONS[area.slug] || 'shield'} />
              <div className="flex-1">
                <h2 className="text-lg font-medium mb-2 group-hover:text-blue transition-colors flex items-center justify-center sm:justify-start gap-2">
                  {stripFaPrefix(area.title)}
                  <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </h2>
                {area.summary && <p className="text-base text-gray-600 leading-relaxed">{area.summary}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <EditPageButton rkey="areas" />
    </div>
  )
}

function AreasGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <polygon points="480,80 540,150 480,220 420,150" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="580,180 630,240 580,300 530,240" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="400,280 460,350 400,420 340,350" stroke="#C3E1FF" strokeWidth="0.75" />
      <polygon points="540,330 590,390 540,450 490,390" stroke="#C3E1FF" strokeWidth="0.75" />
      <line x1="480" y1="220" x2="530" y2="240" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="540" y1="150" x2="580" y2="180" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="420" y1="150" x2="400" y2="280" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="460" y1="350" x2="490" y2="390" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="300" x2="540" y2="330" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="80" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="180" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="280" r="3" fill="#C3E1FF" />
      <circle cx="540" cy="330" r="3" fill="#C3E1FF" />
    </svg>
  )
}

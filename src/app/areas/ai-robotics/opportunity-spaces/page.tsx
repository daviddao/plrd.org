import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import opportunityData from '@/data/fa2/ai-opportunityspaces.json'

export const metadata: Metadata = {
  title: 'Opportunity Spaces – AI & Robotics',
  description: 'Four foundational infrastructure layers where PL can catalyze the open substrate that autonomous AI and robotics systems require.',
}

export default function OpportunitySpacesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Areas', href: '/areas' },
          { label: 'AI & Robotics', href: '/areas/ai-robotics' },
          { label: 'Opportunity Spaces' },
        ]}
      />

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl lg:text-[36px] font-semibold mb-3">{opportunityData.meta.title}</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          {opportunityData.meta.subtitle}
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-px bg-gray-200">
        {opportunityData.opportunities.map((opp) => (
          <Link
            key={opp.id}
            href={`/areas/ai-robotics/opportunity-spaces/${opp.id}/`}
            className="bg-white p-8 hover:bg-gray-50 transition-colors relative overflow-hidden group"
          >
            <OppCardGeo />
            {opp.image && (
              <div className="h-28 mb-5 bg-gray-100 overflow-hidden rounded-sm">
                <img
                  src={opp.image}
                  alt={opp.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            )}
            <h3 className="relative z-10 text-lg font-medium text-black group-hover:text-blue transition-colors mb-1">
              {opp.title}
            </h3>
            {opp.tagline && (
              <p className="relative z-10 text-sm text-gray-400 mb-3">{opp.tagline}</p>
            )}
            <p className="relative z-10 text-base text-gray-600 leading-relaxed mb-4">
              {opp.description.slice(0, 140)}...
            </p>
            {opp.subfields.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-1.5">
                {opp.subfields.map((sf) => (
                  <span key={sf} className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-sm">
                    {sf}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function OppCardGeo() {
  return (
    <svg
      className="absolute right-2 top-2 w-14 h-14 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none select-none"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="24" stroke="#C3E1FF" strokeWidth="0.75" strokeDasharray="3 2" />
      <circle cx="30" cy="30" r="16" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="30" cy="6" r="2" fill="#C3E1FF" />
      <circle cx="54" cy="30" r="2" fill="#C3E1FF" />
      <circle cx="6" cy="30" r="2" fill="#C3E1FF" />
      <line x1="30" y1="6" x2="30" y2="14" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="46" y1="30" x2="54" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="6" y1="30" x2="14" y2="30" stroke="#C3E1FF" strokeWidth="0.5" />
    </svg>
  )
}

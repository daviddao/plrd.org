import Link from 'next/link'
import type { Metadata } from 'next'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'
import FundingPipeline from '@/components/FundingPipeline'

export const metadata: Metadata = {
  title: 'Economies & Governance',
  description: 'Creating more efficient and equitable structures for global progress through crypto-native infrastructure.',
}

export default function FA2MainPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Focus Areas', href: '/areas/' }, { label: 'Economies & Governance' }]} />
      {/* Hero */}
      <div className="relative pt-8 pb-12 mb-12 overflow-hidden">
        {/* Background image - rotated hexagon clip */}
        <div 
          className="absolute right-[0%] top-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[380px] md:h-[380px] lg:w-[460px] lg:h-[460px] pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <clipPath id="hexClip">
                <polygon 
                  points="200,40 330,110 330,290 200,360 70,290 70,110" 
                >
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    from="45 200 200" 
                    to="405 200 200" 
                    dur="60s" 
                    repeatCount="indefinite"
                  />
                </polygon>
              </clipPath>
              <mask id="hexFade">
                <radialGradient id="fadeGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="50%" stopColor="white" />
                  <stop offset="100%" stopColor="black" />
                </radialGradient>
                <circle cx="200" cy="200" r="200" fill="url(#fadeGrad)" />
              </mask>
            </defs>
            <image 
              href="/images/fa2/fa2.webp" 
              x="0" y="0" 
              width="400" height="400" 
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#hexClip)"
              mask="url(#hexFade)"
              opacity="0.35"
            />
          </svg>
        </div>

        <div className="flex items-start gap-5 mb-6">
          <HexagonIcon className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 text-blue/70" />
          <h1 className="relative z-10 text-2xl lg:text-[44px] font-semibold leading-[1.1] tracking-tight max-w-xl">
            Economies & Governance
          </h1>
        </div>
        <p className="relative z-10 text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">
          Building crypto-native economic and governance infrastructure to create more efficient, equitable structures that coordinate at the scale of nation-states.
        </p>
        <div className="relative z-10 flex flex-wrap gap-4 mb-10">
          <Link 
            href="/areas/economies-governance/opportunity-spaces/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
          >
            Opportunity Spaces
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="https://grants.plresearch.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue/30 text-blue rounded-full hover:bg-blue/5 transition-colors font-medium"
          >
            Apply for Grants
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4">
          <AuthorCard slug="david-dao" variant="lead" />
          <AuthorCard slug="james-tunningley" variant="lead" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <p className="text-base text-gray-700 leading-relaxed mb-5 max-w-3xl">
          This focus area rectifies the inadequacies of current macro systems, which often struggle to coordinate and solve monumental challenges like climate change. By leveraging cryptoeconomics and improved governance tools, we are rethinking how capital is formed and deployed.
        </p>
        <p className="text-base text-gray-700 leading-relaxed max-w-3xl">
          This movement harnesses mechanism design to align millions of people worldwide toward shared goals, creating structures that can allocate resources at the scale of nation-states for the benefit of all humanity.
        </p>
      </div>

      {/* Explore */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Explore</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <ExploreCard
          href="/areas/economies-governance/subareas/"
          label="Domains"
          title="Subareas"
          description="9 interconnected subfields driving systemic change."
        />
        <ExploreCard
          href="/areas/economies-governance/opportunity-spaces/"
          label="Strategy"
          title="Opportunity Spaces"
          description="4 convergence zones for systemic change."
        />
        <ExploreCard
          href="/areas/economies-governance/impact/"
          label="Metrics"
          title="Impact Dashboard"
          description="Ecosystem impact across villages and funding."
        />
        <ExploreCard
          href="/areas/economies-governance/projects/"
          label="Ecosystem"
          title="Project Explorer"
          description="242+ teams building public goods infrastructure."
        />
        <ExploreCard
          href="/areas/economies-governance/dependency-graph/"
          label="Architecture"
          title="Dependency Graph"
          description="Strategic dependency trees across 4 inflection points."
        />
      </div>

      {/* Grants */}
      <div className="mt-16 mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Grants</h2>
        <FundingPipeline />
        <a
          href="https://grants.plresearch.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-base text-blue hover:text-black border border-blue/30 hover:border-black/30 px-5 py-2.5 rounded-full transition-colors font-medium"
        >
          Apply for Grants
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>

      {/* How to Engage */}
      <div className="mt-16">
        <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">How to Engage</h2>
        <p className="text-base text-gray-600 mb-6">We are actively seeking:</p>
        <div className="grid md:grid-cols-2 gap-6">
          <EngageItem
            title="Feedback on this framing"
            description="Does this opportunity space resonate? What's missing? What's wrong?"
          />
          <EngageItem
            title="Case studies and examples"
            description="What sovereign DPI deployments, DeSci infrastructure, DePIN projects, or PGF mechanisms should we be learning from?"
          />
          <EngageItem
            title="Partner identification"
            description="Who else should be at the table? What institutions, teams, or individuals are essential to this work?"
          />
          <EngageItem
            title="Technical input"
            description="What reference architectures, standards, or specifications would be most valuable?"
          />
          <EngageItem
            title="Strategic counsel"
            description="What have we gotten wrong about the field, the opportunity, or the approach?"
          />
        </div>
        <a
          href="https://forms.gle/xfuuf8U6UPX3obnh8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-base text-blue hover:text-black border border-blue/30 hover:border-black/30 px-5 py-2.5 rounded-full transition-colors"
        >
          Share feedback
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>
    </div>
  )
}

function EngageItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-gray-100 pl-5">
      <h3 className="text-base font-medium text-black mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function NavPill({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-2xl hover:border-blue hover:shadow-sm transition-all no-underline"
    >
      <span className="flex flex-col">
        <span className="text-base font-medium text-black group-hover:text-blue transition-colors">{label}</span>
        <span className="text-xs text-gray-400">{description}</span>
      </span>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

function ExploreCard({ href, label, title, description }: { href: string; label: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-blue/30 hover:shadow-md transition-all no-underline"
    >
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</div>
        <h3 className="text-base font-medium text-black group-hover:text-blue transition-colors mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 group-hover:text-blue group-hover:translate-x-1 transition-all shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// Economies & Governance - Hexagon network (animated)
function HexagonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <polygon
        points="20,6 30,12 30,24 20,30 10,24 10,12"
        className="stroke-current"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      >
        <animateTransform attributeName="transform" type="rotate" values="0 20 18;360 20 18" dur="30s" repeatCount="indefinite" />
      </polygon>
      <circle cx="20" cy="6" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="30" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="20" cy="30" r="2" className="fill-current" opacity="0.6">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="10" cy="24" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.2s" />
      </circle>
      <circle cx="10" cy="12" r="1.5" className="fill-current" opacity="0.4">
        <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="20" cy="18" r="3" className="stroke-current" strokeWidth="1" fill="none" opacity="0.5">
        <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function AreaGeo() {
  return (
    <svg
      className="absolute top-2 right-0 w-[300px] h-[240px] lg:w-[380px] lg:h-[300px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="480" cy="130" r="70" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="560" cy="250" r="50" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="400" cy="260" r="90" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="520" cy="380" r="55" stroke="#C3E1FF" strokeWidth="1" />
      <line x1="480" y1="130" x2="560" y2="250" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="560" y1="250" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="260" x2="480" y2="130" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="260" x2="520" y2="380" stroke="#C3E1FF" strokeWidth="0.5" />
      <circle cx="480" cy="130" r="3" fill="#C3E1FF" />
      <circle cx="560" cy="250" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="260" r="3" fill="#C3E1FF" />
      <circle cx="520" cy="380" r="3" fill="#C3E1FF" />
    </svg>
  )
}

import type { Metadata } from 'next'
import EditPageButton from '@/components/EditPageButton'
import { PageEditHistoryByline } from '@/components/EditHistoryByline'
import Link from 'next/link'
import AuthorCard from '@/components/AuthorCard'
import Breadcrumb from '@/components/Breadcrumb'
import { FOCUS_AREA_DESCRIPTIONS } from '@/lib/focus-area-descriptions'
import { fetchPage, getSection } from "@/lib/indexer"

export const metadata: Metadata = {
  title: 'About',
}

export default async function AboutPage() {
  const page = await fetchPage("about")
  const hero = getSection(page, "hero")
  const history = getSection(page, "history")
  const collabs = getSection(page, "collaborations")
  const future = getSection(page, "future")
  const quoteJuan = getSection(page, "quote-juan")
  const quoteWill = getSection(page, "quote-will")

  const historyFallback =
    "Those efforts became IPFS, a free and open-source software project to allow users and applications to directly share information without needing a central server. Within IPFS, expertise in programming language theory led to Multiformats, an effort to make our technologies adaptable and upgradable in a future-proof way, and IPLD, our data model for content-addressed data.\n\nIn parallel with IPFS, where users voluntarily store data they find interesting, we designed and launched Filecoin, a protocol that allows users to pay others to store data they find interesting. Originally proposed in 2014, the Filecoin concept was further detailed in our 2017 whitepaper, with CryptoLab efforts supporting both the network launch and future improvements.\n\nProtocol Labs has evolved and expanded beyond internet infrastructure to address broader challenges in coordination, AI development, and human enhancement technologies. What was once the company behind IPFS and Filecoin is now an innovation network that supports field-building, grant-making, and investing across emerging technologies. PL's focus areas now span the full spectrum from securing digital rights to pioneering responsible advancement in AI, robotics, and neurotechnology. PL R&D is the corner of the network that supports the early engineering and research efforts that will drive these focus areas forward."

  const futureFallback =
    "This critical century demands both caution and ambition. With technologies capable of rewriting genetic codes and reshaping how billions coordinate, we're building robust foundations across our four focus areas. From securing digital human rights through Web3 infrastructure to advancing AI and neurotechnology responsibly, from pioneering public goods funding mechanisms to developing breakthrough coordination systems, our work aims to harness humanity's potential while navigating existential challenges.\n\nWe do these things in ways that make technology easy to upgrade and hard to turn against users. We work toward this ideal by building open-source software, with users and contributors as vital components in the development process, and a licensing stack that ensures these tools remain free to obtain and use. Through collaboration across our focus areas, we're accelerating the R&D pipeline to push humanity forward."

  return (
    <div>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Breadcrumb items={[{ label: 'About' }]} />
        <div className="mt-4 empty:hidden">
          <PageEditHistoryByline rkey="about" />
        </div>
        <div className="relative pt-4 pb-16 lg:pt-8 lg:pb-20 overflow-hidden">
          {/* Background image - rotated hexagon clip */}
          <div 
            className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[480px] md:h-[480px] lg:w-[580px] lg:h-[580px] pointer-events-none select-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <clipPath id="aboutHexClip">
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
                <mask id="aboutHexFade">
                  <radialGradient id="aboutFadeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="50%" stopColor="white" />
                    <stop offset="100%" stopColor="black" />
                  </radialGradient>
                  <circle cx="200" cy="200" r="200" fill="url(#aboutFadeGrad)" />
                </mask>
              </defs>
              <image 
                href="/images/banners/about-banner.webp" 
                x="0" y="0" 
                width="400" height="400" 
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#aboutHexClip)"
                mask="url(#aboutHexFade)"
                opacity="0.55"
              />
            </svg>
          </div>

          <h1 className="relative z-10 font-normal text-[28px] md:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6 max-w-xl">
            {hero?.title || "Our research is driven by beliefs about how technology should serve humanity."}
          </h1>
          <p className="relative z-10 text-gray-600 text-lg md:text-xl lg:text-[22px] leading-relaxed max-w-2xl mb-6">
            {hero?.body || hero?.subtitle || "Substantial engineering efforts are necessary to turn ideas into real and useful tools that people can use. Our longest-term vision-driven innovation takes place in PL R&D."}
          </p>
          <div className="relative z-10 flex flex-wrap gap-4">
            <Link 
              href="/areas" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-full hover:bg-blue/90 transition-colors font-medium"
            >
              Focus areas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              href="/authors" 
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:border-blue hover:text-blue transition-colors font-medium"
            >
              Meet the team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="max-w-6xl mx-auto px-6 mb-28">
        <h2 className="font-semibold text-xl lg:text-2xl mb-10">Our Four Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FocusCard
            slug="digital-human-rights"
            title="Digital Human Rights"
            description={FOCUS_AREA_DESCRIPTIONS['digital-human-rights']}
          />
          <FocusCard
            slug="economies-governance"
            title="Economies & Governance"
            description={FOCUS_AREA_DESCRIPTIONS['economies-governance']}
          />
          <FocusCard
            slug="ai-robotics"
            title="AI & Robotics"
            description={FOCUS_AREA_DESCRIPTIONS['ai-robotics']}
          />
          <FocusCard
            slug="neurotech"
            title="Neurotechnology"
            description={FOCUS_AREA_DESCRIPTIONS.neurotech}
          />
        </div>
      </div>

      {/* History */}
      <Section label="OUR HISTORY" title={history?.title || "Protocol Labs began with the desire to make it easy to name, organize, and share data in a scalable way."}>
        <div className="lg:columns-2 lg:gap-14 text-base text-gray-700 leading-relaxed">
          {(history?.body || historyFallback).split("\n\n").map((p, i) => (
            <p key={i} className="pb-6 break-inside-avoid">{p}</p>
          ))}
        </div>
      </Section>

      {/* Collaborations */}
      <Section label="COLLABORATIONS AND SUPPORT" title={collabs?.title || "In addition to driving internal projects directly, we also support external research."}>
        <p className="text-base text-gray-700 leading-relaxed lg:columns-2 lg:gap-14">
          {collabs?.body || "Some of this support takes the form of our grant program, which supports academic research efforts related to the central mission and goals of Protocol Labs. Other support includes conference and event sponsorships, which usually involves representation from Protocol Labs researchers. If you're attending a conference we are sponsoring, you have a great chance of catching one of us in person. Alternatively, our conference sponsorships often take the form of sponsoring free, high-quality recordings of the talks to educate (or entertain) those unable to attend."}
        </p>
      </Section>

      {/* Quote */}
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <img className="mb-8 opacity-30 w-10" src="/images/about-page/quote-icon.svg" alt="" />
        <h3 className="font-semibold text-xl lg:text-2xl leading-relaxed mb-8">
          {quoteJuan?.body || quoteJuan?.title || "More innovation faster"}
        </h3>
        <AuthorCard slug="juan-benet" />
      </div>

      {/* The Future */}
      <Section label="THE FUTURE" title={future?.title || "In our pursuit of this mission, we question how technology could work better and what we wish it would do."}>
        <div className="lg:columns-2 lg:gap-14 text-base text-gray-700 leading-relaxed">
          {(future?.body || futureFallback).split("\n\n").map((p, i) => (
            <p key={i} className="pb-6 break-inside-avoid">{p}</p>
          ))}
        </div>
      </Section>

      {/* Will Scott quote */}
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="border-l-2 border-pink pl-8 py-3">
          <p className="text-lg text-gray-700 leading-relaxed mb-5 italic">
            {quoteWill?.body || "\u201cWe consistently bet, not only that the future could be a fantastic and wonderful place, but that it\u2019s worthwhile for us, as an organization, to work toward that future.\u201d"}
          </p>
          <AuthorCard slug="will-scott" />
        </div>
      </div>
      <EditPageButton rkey="about" />
    </div>
  )
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 mb-28">
      <p className="text-pink text-sm tracking-wide mb-3">{label}</p>
      <h2 className="font-semibold text-xl lg:text-2xl leading-relaxed mb-8 max-w-3xl">{title}</h2>
      {children}
    </div>
  )
}

function FocusCard({ slug, title, description }: { slug: string; title: string; description: string }) {
  return (
    <Link href={`/areas/${slug}`} className="border border-gray-300 p-8 hover:border-blue hover:shadow-sm transition-all block">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-base text-gray-700">{description}</p>
    </Link>
  )
}

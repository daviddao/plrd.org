import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import { siteConfig } from '@/lib/site-config'
import { AuthProvider } from '@/lib/atproto'
import SiteShell from '@/components/SiteShell'
import GoatCounter from '@/components/GoatCounter'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.baseUrl),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    locale: siteConfig.locale,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.avatar, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterUser,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.avatar],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Protocol Labs R&D',
    alternateName: siteConfig.title,
    url: siteConfig.baseUrl,
    logo: `${siteConfig.baseUrl}${siteConfig.logo}`,
    description: siteConfig.description,
    sameAs: [
      'https://protocol.ai',
      'https://bsky.app/profile/plrd.org',
      'https://github.com/protocol/plrd',
    ],
  }

  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    url: siteConfig.baseUrl,
    description: siteConfig.description,
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${newsreader.variable} font-body min-w-[320px] text-base text-black leading-normal antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
        <GoatCounter />
      </body>
    </html>
  )
}

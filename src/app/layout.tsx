import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import { siteConfig } from '@/lib/site-config'
import { AuthProvider } from '@/lib/atproto'
import SiteShell from '@/components/SiteShell'
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
  openGraph: {
    type: 'website',
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
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${newsreader.variable} font-body min-w-[320px] text-base text-black leading-normal antialiased`}>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Newsreader } from 'next/font/google'
import { siteConfig } from '@/lib/site-config'
import { AuthProvider } from '@/lib/atproto'
import SiteShell from '@/components/SiteShell'
import './globals.css'

const aileron = localFont({
  src: [
    {
      path: '../../public/fonts/Aileron-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-aileron',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-newsreader',
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
    <html lang="en">
      <body className={`${aileron.variable} ${newsreader.variable} font-[family-name:var(--font-aileron)] min-w-[320px] text-base text-black leading-normal antialiased`}>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  )
}
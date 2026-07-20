import { NextResponse, type NextRequest } from 'next/server'

// Countries where prior consent is legally required before setting non-essential
// (analytics) cookies: the EU/EEA under the ePrivacy Directive + GDPR, and the
// UK under PECR + UK GDPR. Everywhere else follows an opt-out model, so we skip
// the banner there (and let visitors opt out via the footer "Cookie settings").
const CONSENT_REQUIRED_COUNTRIES = new Set([
  // EU member states
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA (non-EU)
  'IS', 'LI', 'NO',
  // United Kingdom
  'GB',
])

const REGION_COOKIE = 'pl-consent-region'

export function middleware(req: NextRequest) {
  // Vercel injects the visitor's country here at the edge.
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase()

  // Fail safe toward privacy: if geo is unknown (e.g. local dev), require consent.
  const required = country === '' || CONSENT_REQUIRED_COUNTRIES.has(country)

  const res = NextResponse.next()
  res.cookies.set(REGION_COOKIE, required ? 'required' : 'open', {
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // must be readable by the client consent component
    maxAge: 60 * 60 * 24, // refresh daily
  })
  return res
}

export const config = {
  // Run on pages only — skip API routes, static assets, and files with extensions.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}

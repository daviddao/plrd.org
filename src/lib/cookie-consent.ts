// Feature flag for the analytics cookie-consent banner + footer "Cookie
// settings" link.
//
// OFF by default: no banner is shown and Google Analytics loads directly
// whenever NEXT_PUBLIC_GA_ID is set. Set NEXT_PUBLIC_COOKIE_CONSENT=on to
// bring the consent flow back (recommended for EU/EEA/UK visitors).
//
// To re-enable everywhere without touching env vars, see the companion PR that
// flips this single line to `!== 'off'`.
export const COOKIE_CONSENT_ENABLED =
  process.env.NEXT_PUBLIC_COOKIE_CONSENT === 'on'

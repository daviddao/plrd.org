// Feature flag for the analytics cookie-consent banner + footer "Cookie
// settings" link.
//
// ON by default: the consent banner is shown and Google Analytics only loads
// after the visitor agrees. Set NEXT_PUBLIC_COOKIE_CONSENT=off to hide the
// banner and load analytics directly.
export const COOKIE_CONSENT_ENABLED =
  process.env.NEXT_PUBLIC_COOKIE_CONSENT !== 'off'

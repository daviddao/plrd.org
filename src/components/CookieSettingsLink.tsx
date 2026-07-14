'use client'

import { OPEN_SETTINGS_EVENT } from './CookieConsent'

// Footer affordance so any visitor — in any region — can open the consent
// banner and opt in or out of analytics at any time.
export default function CookieSettingsLink({
  className,
}: {
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
      className={className}
    >
      Cookie settings
    </button>
  )
}

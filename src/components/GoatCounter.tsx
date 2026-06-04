'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// GoatCounter privacy-friendly analytics. The count.js script auto-counts the
// initial page load; because this is an App Router SPA, subsequent navigations
// happen client-side and must be counted manually on pathname change.
const GOATCOUNTER_ENDPOINT = 'https://plrd.goatcounter.com/count'

declare global {
  interface Window {
    goatcounter?: {
      count?: (vars?: { path?: string; title?: string; referrer?: string; event?: boolean }) => void
    }
  }
}

export default function GoatCounter() {
  const pathname = usePathname()
  const skippedInitial = useRef(false)

  useEffect(() => {
    // Skip the first run: count.js already records the initial load itself.
    if (!skippedInitial.current) {
      skippedInitial.current = true
      return
    }
    window.goatcounter?.count?.({ path: pathname })
  }, [pathname])

  return (
    <Script
      data-goatcounter={GOATCOUNTER_ENDPOINT}
      src="//gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  )
}

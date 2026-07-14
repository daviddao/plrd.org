import Link from 'next/link'

/**
 * Explicit "back to the Insights explorer" link for the listing subpages
 * (/blog, /publications, /talks), which are surfaced from Insights via the
 * "All …" links. Gives visitors a clear way back without reaching for Home.
 */
export default function BackToInsights() {
  return (
    <Link
      href="/insights/"
      className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue hover:underline"
    >
      <span aria-hidden="true">←</span> Back to Insights
    </Link>
  )
}

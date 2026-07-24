import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Failed to replicate',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="max-w-[1146px] mx-auto pt-32 pb-24 px-4 md:px-10 text-center">
      <p className="mb-4 font-mono text-sm uppercase tracking-widest text-blue">
        Error 404 · negative result
      </p>
      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        This result failed to replicate.
      </h1>
      <p className="max-w-xl mx-auto text-base text-gray-600 mb-10">
        We searched every trial and couldn&rsquo;t reproduce that page. It may have
        been a promising early signal that didn&rsquo;t hold up &mdash; or a link
        that decayed over time. Back to the drawing board.
      </p>

      <pre className="max-w-md mx-auto mb-10 overflow-x-auto rounded-lg border border-gray-300 bg-gray-100 p-4 text-left font-mono text-xs leading-relaxed text-gray-600">
{`> query .............. requested page
> status ............. NOT FOUND (404)
> peer review ........ REJECTED
> replication ....... 0/12 labs
> conclusion ........ inconclusive; retry`}
      </pre>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/"
          className="rounded-full bg-blue px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to the lab
        </Link>
        <Link href="/research" className="text-sm font-medium text-blue hover:underline">
          Browse the research &rarr;
        </Link>
      </div>
    </div>
  )
}

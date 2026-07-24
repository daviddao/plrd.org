import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Lost in the chasm',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="max-w-[1146px] mx-auto pt-32 pb-24 px-4 md:px-10 text-center">
      <p className="mb-4 font-mono text-sm uppercase tracking-widest text-blue">
        Error 404 · lost in the chasm
      </p>
      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        This page fell into the innovation chasm.
      </h1>
      <p className="max-w-xl mx-auto text-base text-gray-600 mb-10">
        Somewhere between a promising idea and a shipped reality, this page
        didn&rsquo;t make it across. That gap is exactly what we work to bridge
        &mdash; the page, sadly, we could not.
      </p>

      <pre className="max-w-md mx-auto mb-10 overflow-x-auto rounded-lg border border-gray-300 bg-gray-100 p-4 text-left font-mono text-xs leading-relaxed text-gray-600">
{`> locating page ........ 404
> stage ................ stuck in the chasm
> bridge status ........ not yet built
> next step ............ reroute to solid ground`}
      </pre>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/"
          className="rounded-full bg-blue px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to solid ground
        </Link>
        <Link href="/about" className="text-sm font-medium text-blue hover:underline">
          See how we bridge the chasm &rarr;
        </Link>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import {
  predictionMarketMeta,
  predictionMarketMappings,
  fetchPolymarketOdds,
  type MarketMatch,
} from '@/lib/predictionMarkets'

export const metadata: Metadata = {
  title: 'Signals — Inflection points, priced by the crowd',
  description: predictionMarketMeta.subtitle,
}

// Revalidate hourly (odds are cached per-slug in the fetch helper too).
export const revalidate = 3600

const matchLabel: Record<MarketMatch, string> = {
  direct: 'Direct market',
  proxy: 'Proxy market',
  gap: 'No market yet',
}

const matchStyle: Record<MarketMatch, string> = {
  direct: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  proxy: 'bg-amber-50 text-amber-700 border-amber-200',
  gap: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default async function SignalsPage() {
  // Fetch live odds per mapping (passing the mapping's question as a hint so
  // multi-threshold events resolve to the right line).
  const odds = await Promise.all(
    predictionMarketMappings.map((m) =>
      m.market.slug ? fetchPolymarketOdds(m.market.slug, m.market.question) : Promise.resolve(null),
    ),
  )

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Signals' }]} />

      <h1 className="mt-6 text-lg md:text-[32px] leading-tight font-semibold">
        {predictionMarketMeta.title}
      </h1>
      <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl">
        {predictionMarketMeta.subtitle}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {predictionMarketMappings.map((m, i) => {
          const o = odds[i]
          const pct = o && o.yesPrice != null ? Math.round(o.yesPrice * 100) : null
          return (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {m.area}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${matchStyle[m.match]}`}
                >
                  {matchLabel[m.match]}
                </span>
              </div>

              <div className="font-semibold text-gray-900">{m.opportunitySpace}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{m.inflectionPoint}</p>

              <div className="mt-auto pt-3 border-t border-gray-100">
                {m.match === 'gap' ? (
                  <p className="text-sm text-gray-500 italic">{m.market.question}</p>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400">{m.market.platform}</div>
                      <a
                        href={m.market.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 hover:underline block truncate"
                        title={m.market.question}
                      >
                        {m.market.question}
                      </a>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-semibold tabular-nums text-gray-900">
                        {pct != null ? `${pct}%` : '—'}
                      </div>
                      <div className="text-[11px] text-gray-400">crowd&nbsp;yes</div>
                    </div>
                  </div>
                )}
                {m.market.note && (
                  <p className="mt-2 text-[12px] text-gray-400 leading-snug">
                    {m.market.note}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-gray-400 max-w-3xl leading-relaxed">
        {predictionMarketMeta.disclaimer}
      </p>
    </div>
  )
}

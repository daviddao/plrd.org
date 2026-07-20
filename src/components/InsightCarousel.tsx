'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/format'

type InsightItem = {
  title: string
  date: string
  type: string
  permalink: string
  coverImage?: string
}

const TYPE_COLORS: Record<string, string> = {
  Publication: '#1982F4',
  Talk: '#12bfdf',
  'Talks & Podcasts': '#12bfdf',
  Blog: '#E51A66',
}

export default function InsightCarousel({ items }: { items: InsightItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  const updateProgress = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => el.removeEventListener('scroll', updateProgress)
  }, [updateProgress])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('a')
    const step = (card?.offsetWidth || 320) + 20
    el.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1"
      >
        {items.map((item) => {
          const color = TYPE_COLORS[item.type] || '#1982F4'
          return (
            <Link
              key={item.permalink}
              href={item.permalink}
              className="group flex-none w-[280px] sm:w-[310px] md:w-[340px] flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
            >
              {item.coverImage ? (
                <div
                  className="h-[180px] bg-cover bg-center bg-gray-100"
                  style={{ backgroundImage: `url('${item.coverImage}')` }}
                />
              ) : (
                <div
                  className="h-[180px] relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, ${color}33 100%)` }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 40%, ${color} 1px, transparent 1px), radial-gradient(circle at 70% 60%, ${color} 1px, transparent 1px)`,
                      backgroundSize: '24px 24px, 32px 32px',
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.04em] px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600 self-start mb-3">
                  {item.type}
                </span>
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="font-serif text-[17px] font-medium leading-snug tracking-tight line-clamp-3">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[13px] text-gray-500 mt-auto pt-4">
                  {formatDate(item.date)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="w-[200px] h-[3px] bg-gray-200 rounded-full relative">
          <div
            className="absolute h-full w-[30%] bg-blue rounded-full transition-[left] duration-150"
            style={{ left: `${progress * 70}%` }}
          />
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30"
            aria-label="Previous"
            disabled={progress <= 0}
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30"
            aria-label="Next"
            disabled={progress >= 0.99}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

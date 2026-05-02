import type { ReactNode } from 'react'
import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

function normalizeHref(href: string) {
  if (!href.startsWith('/') || href === '/') return href

  const hashIndex = href.indexOf('#')
  const queryIndex = href.indexOf('?')
  const splitIndex = [hashIndex, queryIndex].filter((i) => i >= 0).sort((a, b) => a - b)[0]
  const path = splitIndex === undefined ? href : href.slice(0, splitIndex)
  const suffix = splitIndex === undefined ? '' : href.slice(splitIndex)

  return path.endsWith('/') ? `${path}${suffix}` : `${path}/${suffix}`
}

function CrumbLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={normalizeHref(href)} className="hover:text-black transition-colors">
      {children}
    </Link>
  )
}

export default function Breadcrumb({ items }: Props) {
  const current = items[items.length - 1]
  const previous = [...items].slice(0, -1).reverse().find((item) => item.href) ?? { label: 'Home', href: '/' }

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="hidden sm:flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
        <li>
          <CrumbLink href="/">Home</CrumbLink>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">/</span>
            {item.href ? (
              <CrumbLink href={item.href}>{item.label}</CrumbLink>
            ) : (
              <span className="text-gray-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>

      <div className="sm:hidden text-sm text-gray-400">
        {items.length <= 1 ? (
          <div className="flex items-center gap-2">
            <CrumbLink href="/">Home</CrumbLink>
            {current && (
              <>
                <span>/</span>
                <span className="text-gray-600">{current.label}</span>
              </>
            )}
          </div>
        ) : (
          <CrumbLink href={previous.href ?? '/'}>← {previous.label}</CrumbLink>
        )}
      </div>
    </nav>
  )
}

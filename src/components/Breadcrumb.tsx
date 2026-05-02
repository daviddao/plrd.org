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

function DesktopCrumb({ item, index }: { item: BreadcrumbItem; index: number }) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      <span className="shrink-0">/</span>
      {item.href ? (
        <CrumbLink href={item.href}>{item.label}</CrumbLink>
      ) : (
        <span className={index > 1 ? 'max-w-[36rem] truncate text-gray-600' : 'text-gray-600'} title={item.label}>
          {item.label}
        </span>
      )}
    </li>
  )
}

export default function Breadcrumb({ items }: Props) {
  const current = items[items.length - 1]
  const previous = [...items].slice(0, -1).reverse().find((item) => item.href) ?? { label: 'Home', href: '/' }
  const desktopItems = items.length > 2 ? items.slice(-2) : items

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="hidden sm:flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
        <li>
          <CrumbLink href="/">Home</CrumbLink>
        </li>
        {items.length > 2 && (
          <li className="flex items-center gap-2" aria-hidden="true">
            <span>/</span>
            <span>…</span>
          </li>
        )}
        {desktopItems.map((item, index) => (
          <DesktopCrumb key={`${item.label}-${index}`} item={item} index={index} />
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

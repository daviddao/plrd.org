import Link from 'next/link'
import { authors } from '@/lib/content'
import { slugToName } from '@/lib/format'

type AuthorCardProps = {
  slug: string
  variant?: 'default' | 'lead' | 'advisor'
}

export default function AuthorCard({ slug, variant = 'default' }: AuthorCardProps) {
  const author = authors.find((a) => a.slug === slug)
  const name = author?.name || slugToName(slug)
  const role = author?.role || ''
  const institution = author?.groups.filter(Boolean).join(', ') || ''
  const avatar = author?.avatarPath || null

  if (variant === 'lead') {
    return (
      <Link 
        href={`/authors/${slug}`} 
        className="inline-flex items-center gap-4 py-3 px-5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all no-underline group"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
        ) : (
          <span className="w-12 h-12 rounded-full bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center text-gray-400 text-lg font-medium">
            {name.charAt(0)}
          </span>
        )}
        <span className="flex flex-col leading-tight">
          <span className="text-base font-medium text-black group-hover:text-blue transition-colors">{name}</span>
          {role && <span className="text-sm text-gray-500 mt-0.5">{role}</span>}
          <span className="text-xs text-blue/70 mt-1 font-medium">Area Lead</span>
        </span>
      </Link>
    )
  }

  if (variant === 'advisor') {
    return (
      <Link
        href={`/authors/${slug}`}
        className="inline-flex items-center gap-3 py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all no-underline group"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
        ) : (
          <span className="w-10 h-10 rounded-full bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center text-gray-400 font-medium">
            {name.charAt(0)}
          </span>
        )}
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-black group-hover:text-blue transition-colors">{name}</span>
          {institution && <span className="text-xs text-gray-500 mt-0.5">{institution}</span>}
        </span>
      </Link>
    )
  }

  return (
    <Link href={`/authors/${slug}`} className="inline-flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-gray-200 hover:border-blue/40 transition-colors no-underline group">
      {avatar ? (
        <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
      )}
      <span className="flex flex-col leading-none gap-0.5">
        <span className="text-sm font-medium text-black group-hover:text-blue">{name}</span>
        {role && <span className="text-[11px] text-gray-500">{role}</span>}
      </span>
    </Link>
  )
}

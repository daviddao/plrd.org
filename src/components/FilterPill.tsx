'use client'

/**
 * Shared filter pill used by the Insights explorer and the /blog, /publications
 * and /talks listing pages. Keeps the focus-area / content-type filters visually
 * consistent across the site.
 *
 * A pill with `count === 0` is rendered as `disabled` (there is nothing to show)
 * but stays fully legible — the label and its `0` remain readable rather than
 * fading into the background.
 */
export function FilterPill({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
        active
          ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
          : disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
      }`}
    >
      {label}
      {typeof count === 'number' && (
        <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>{count}</span>
      )}
    </button>
  )
}

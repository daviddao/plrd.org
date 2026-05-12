function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttribute(str: string): string {
  return escapeHtml(str).replace(/"/g, '&quot;')
}

function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href)
}

function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
      const safeHref = isSafeHref(href) ? href : '#'
      return `<a href="${escapeAttribute(safeHref)}">${label}</a>`
    })
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(>])_([^_\n]+?)_(?=$|[\s).,!?:;])/g, '$1<em>$2</em>')
    .replace(/(^|[\s(>])\*([^*\n]+?)\*(?=$|[\s).,!?:;])/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br />')
}

function renderHeading(level: 1 | 2 | 3, text: string): string {
  return `<h${level}>${renderInlineMarkdown(text)}</h${level}>`
}

export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/)
    .map((rawBlock) => {
      const block = rawBlock.trim()
      if (!block) return ''

      if (block.startsWith('```')) {
        const code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
        return `<pre><code>${escapeHtml(code)}</code></pre>`
      }

      const [firstLine, ...restLines] = block.split('\n')
      const heading = firstLine.match(/^(#{1,3})\s+(.+)$/)
      if (heading) {
        const level = heading[1].length as 1 | 2 | 3
        const renderedHeading = renderHeading(level, heading[2])
        if (restLines.length === 0) return renderedHeading
        return `${renderedHeading}<p>${renderInlineMarkdown(restLines.join('\n'))}</p>`
      }

      return `<p>${renderInlineMarkdown(block)}</p>`
    })
    .join('')
}

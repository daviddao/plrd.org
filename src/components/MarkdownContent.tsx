import { markdownToHtml } from '@/lib/markdown'

type MarkdownContentProps = {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className = 'page-content' }: MarkdownContentProps) {
  const classes = ['markdown-content', className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  )
}

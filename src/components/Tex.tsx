import katex from 'katex'
import 'katex/dist/katex.min.css'
import { memo, type ReactNode } from 'react'

/** Renders LaTeX with KaTeX. Rendering errors fall back to the raw source instead of crashing. */
export const Tex = memo(function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = katex.renderToString(children, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' })
  return display ? <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />
})

/**
 * Tiny markup renderer used by the lesson content:
 *  - blank line separates paragraphs; lines starting with "- " form a bullet list, "1. " an ordered list
 *  - $…$ inline math, $$…$$ display math (on its own line), **bold**, `code`, _italic_
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return (
    <div className={className ?? 'prose'}>
      {blocks.map((b, i) => (
        <Block key={i} src={b.trim()} />
      ))}
    </div>
  )
}

function Block({ src }: { src: string }) {
  if (src.startsWith('$$') && src.endsWith('$$')) return <Tex display>{src.slice(2, -2).trim()}</Tex>
  const lines = src.split('\n')
  if (lines.every((l) => /^\s*- /.test(l)))
    return (
      <ul>
        {lines.map((l, i) => (
          <li key={i}>
            <Inline src={l.replace(/^\s*- /, '')} />
          </li>
        ))}
      </ul>
    )
  if (lines.every((l) => /^\s*\d+\. /.test(l)))
    return (
      <ol>
        {lines.map((l, i) => (
          <li key={i}>
            <Inline src={l.replace(/^\s*\d+\. /, '')} />
          </li>
        ))}
      </ol>
    )
  return (
    <p>
      <Inline src={lines.join(' ')} />
    </p>
  )
}

export function Inline({ src }: { src: string }) {
  const out: ReactNode[] = []
  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$|\*\*([^*]+)\*\*|`([^`]+)`|_([^_\s][^_]*)_/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index))
    if (m[1] !== undefined) out.push(<Tex key={k++} display>{m[1]}</Tex>)
    else if (m[2] !== undefined) out.push(<Tex key={k++}>{m[2]}</Tex>)
    else if (m[3] !== undefined) out.push(<strong key={k++}><Inline src={m[3]} /></strong>)
    else if (m[4] !== undefined) out.push(<code key={k++}>{m[4]}</code>)
    else if (m[5] !== undefined) out.push(<em key={k++}>{m[5]}</em>)
    last = re.lastIndex
  }
  if (last < src.length) out.push(src.slice(last))
  return <>{out}</>
}

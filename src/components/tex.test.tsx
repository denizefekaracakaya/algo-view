import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import katex from 'katex'
import { LECTURES_BY_LANG } from '../content/curriculum'
import { Rich } from './Tex'

/** The formulas <Rich> hands to KaTeX, split the same way Block and Inline split them. */
function formulas(text: string): string[] {
  const out: string[] = []
  for (const block of text.trim().split(/\n\s*\n/).map((b) => b.trim())) {
    const lines = block.split('\n')
    if (lines.length > 1 && lines.every((l) => /^\s*\$\$.*\$\$\s*$/.test(l))) out.push(...lines.map((l) => l.trim().slice(2, -2)))
    else if (block.startsWith('$$') && block.endsWith('$$')) out.push(block.slice(2, -2))
    else for (const m of block.matchAll(/\$\$([^$]+)\$\$|\$([^$]+)\$/g)) out.push(m[1] ?? m[2])
  }
  return out
}

describe('lesson markup renders without KaTeX errors', () => {
  it('consecutive display formulas become separate blocks', () => {
    const { container } = render(<Rich text={'$$a = b$$\n$$c = d$$'} />)
    expect(container.querySelectorAll('.katex-display')).toHaveLength(2)
    expect(container.querySelector('.katex-error')).toBeNull()
  })
  it('every formula of every lesson in both languages parses', () => {
    const bad: string[] = []
    const walk = (v: unknown) => {
      if (typeof v === 'string') {
        for (const f of formulas(v))
          try {
            katex.renderToString(f, { throwOnError: true, strict: 'ignore' })
          } catch (e) {
            bad.push(`${f} :: ${(e as Error).message}`)
          }
      } else if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    for (const lang of ['tr', 'en'] as const) walk(LECTURES_BY_LANG[lang])
    expect(bad).toEqual([])
  })
})

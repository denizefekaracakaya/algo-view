import type { ReactNode } from 'react'

export type CellState = 'compare' | 'pivot' | 'sorted' | 'less' | 'greater' | 'elim' | 'active' | 'hole' | 'found' | 'none'

/** Glyphs make every state readable without color. */
const STATE_GLYPH: Record<CellState, string> = {
  compare: '?',
  pivot: 'P',
  sorted: '✓',
  less: '<',
  greater: '>',
  elim: '✕',
  active: '•',
  hole: '○',
  found: '★',
  none: '',
}

const STATE_LABEL: Record<CellState, string> = {
  compare: 'karşılaştırılıyor',
  pivot: 'pivot',
  sorted: 'sıralı / son konumunda',
  less: 'pivottan küçük',
  greater: 'pivottan büyük',
  elim: 'elendi',
  active: 'etkin bölge',
  hole: 'boşluk',
  found: 'sonuç',
  none: '',
}

export interface CellSpec {
  value: number | string | null
  state?: CellState
  /** Marker text above the cell (e.g. "i", "j", "lo"). */
  mark?: string
  sub?: string
}

interface Props {
  cells: CellSpec[]
  bars?: boolean
  label: string
  maxValue?: number
  minValue?: number
  showIndex?: boolean
}

/** Array of cells drawn as bars (heights ∝ value) or as boxes. */
export function ArrayView({ cells, bars = true, label, showIndex = true, ...range }: Props) {
  const nums = cells.map((c) => (typeof c.value === 'number' ? c.value : 0))
  const max = range.maxValue ?? Math.max(1, ...nums)
  const min = range.minValue ?? Math.min(0, ...nums)
  const span = Math.max(1, max - min)
  return (
    <div className="arr" role="list" aria-label={label}>
      {cells.map((c, i) => {
        const st = c.state ?? 'none'
        const h = typeof c.value === 'number' ? 18 + ((c.value - min) / span) * 110 : 40
        const desc = `indeks ${i}: ${c.value ?? 'boş'}${st !== 'none' ? ', ' + STATE_LABEL[st] : ''}${c.mark ? ', ' + c.mark : ''}`
        return (
          <div key={i} role="listitem" aria-label={desc} className={`cell st-${st} ${bars ? '' : 'box'}`}>
            {c.mark && <span className="mark">{c.mark}</span>}
            <div className="bar" style={{ height: bars ? h : undefined }}>
              {!bars && <span className="val">{c.value ?? ''}</span>}
            </div>
            {bars && <span className="val">{c.value ?? ''}</span>}
            <span className="idx" aria-hidden>
              {STATE_GLYPH[st] ? `${STATE_GLYPH[st]} ` : ''}
              {c.sub ?? (showIndex ? i : '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function Legend({ states }: { states: CellState[] }): ReactNode {
  return (
    <>
      {states.map((s) => (
        <span key={s} className={`st-${s}`}>
          <span className="swatch" style={swatchStyle(s)} aria-hidden>
            {STATE_GLYPH[s]}
          </span>
          {STATE_LABEL[s]}
        </span>
      ))}
    </>
  )
}

function swatchStyle(s: CellState) {
  const map: Partial<Record<CellState, [string, string]>> = {
    compare: ['--st-compare-bg', '--st-compare'],
    pivot: ['--st-pivot-bg', '--st-pivot'],
    sorted: ['--st-sorted-bg', '--st-sorted'],
    less: ['--st-less-bg', '--st-less'],
    greater: ['--st-greater-bg', '--st-greater'],
    elim: ['--st-elim-bg', '--st-elim'],
    active: ['--st-active-bg', '--st-active'],
    found: ['--st-sorted', '--st-sorted'],
    hole: ['--surface', '--border-strong'],
  }
  const [bg, fg] = map[s] ?? ['--surface-2', '--border-strong']
  return { background: `var(${bg})`, borderColor: `var(${fg})`, color: s === 'found' ? '#fff' : `var(${fg})` }
}

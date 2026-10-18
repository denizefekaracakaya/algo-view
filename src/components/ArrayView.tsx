import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { tx } from '../i18n/lang'

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

const stateLabel = (s: CellState): string =>
  ({
    compare: tx('karşılaştırılıyor', 'being compared'),
    pivot: 'pivot',
    sorted: tx('sıralı / son konumunda', 'sorted / in final position'),
    less: tx('pivottan küçük', 'less than pivot'),
    greater: tx('pivottan büyük', 'greater than pivot'),
    elim: tx('elendi', 'eliminated'),
    active: tx('etkin bölge', 'active region'),
    hole: tx('boşluk', 'gap'),
    found: tx('sonuç', 'result'),
    none: '',
  })[s]

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
const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Animation length for one step; TraceViewer sets --anim-ms from the playback speed. */
function animMs(el: Element): number {
  const v = parseFloat(getComputedStyle(el).getPropertyValue('--anim-ms'))
  return Number.isFinite(v) && v > 0 ? v : 560
}

/**
 * Makes step-to-step changes easy to follow: a value that moved to another index glides there
 * along a small arc (so swaps and shifts read as movement, not as a sudden relabel), a value
 * that appears pops in, and a cell whose state changes pulses once.
 */
function useCellTransitions(ref: React.RefObject<HTMLDivElement | null>, cells: CellSpec[]) {
  const prev = useRef<{ vals: CellSpec['value'][]; states: string[] } | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const vals = cells.map((c) => c.value)
    const states = cells.map((c) => c.state ?? 'none')
    const p = prev.current
    prev.current = { vals, states }
    if (!el || !p || p.vals.length !== vals.length || reducedMotion()) return
    const kids = Array.from(el.children) as HTMLElement[]
    if (!kids.length || typeof kids[0].animate !== 'function') return
    const dur = animMs(el)
    const used = new Set<number>()
    vals.forEach((v, i) => {
      if (v === p.vals[i] || v === null) return
      let src = -1
      p.vals.forEach((pv, j) => {
        if (pv === v && j !== i && vals[j] !== pv && !used.has(j) && (src < 0 || Math.abs(j - i) < Math.abs(src - i))) src = j
      })
      const node = kids[i]
      if (src >= 0) {
        used.add(src)
        const dx = kids[src].offsetLeft - node.offsetLeft
        const lift = -Math.min(34, 12 + Math.abs(dx) / 6)
        node.animate(
          [
            { transform: `translate(${dx}px, 0)`, zIndex: 3 },
            { transform: `translate(${dx / 2}px, ${lift}px)`, zIndex: 3, offset: 0.5 },
            { transform: 'translate(0, 0)', zIndex: 3 },
          ],
          { duration: dur, easing: 'cubic-bezier(.35,.7,.25,1)' },
        )
      } else {
        node.animate([{ transform: 'scale(.55)', opacity: 0.15 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)' }], {
          duration: dur * 0.85,
          easing: 'ease-out',
        })
      }
    })
    states.forEach((st, i) => {
      if (st === p.states[i] || st === 'none' || vals[i] !== p.vals[i]) return
      const bar = kids[i]?.querySelector('.bar') as HTMLElement | null
      bar?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)', filter: 'brightness(1.08)', offset: 0.4 }, { transform: 'scale(1)' }], {
        duration: dur * 0.8,
        easing: 'ease-out',
      })
    })
  })
}

export function ArrayView({ cells, bars = true, label, showIndex = true, ...range }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useCellTransitions(ref, cells)
  const nums = cells.map((c) => (typeof c.value === 'number' ? c.value : 0))
  const max = range.maxValue ?? Math.max(1, ...nums)
  const min = range.minValue ?? Math.min(0, ...nums)
  const span = Math.max(1, max - min)
  return (
    <div className="arr" role="list" aria-label={label} ref={ref}>
      {cells.map((c, i) => {
        const st = c.state ?? 'none'
        const h = typeof c.value === 'number' ? 18 + ((c.value - min) / span) * 110 : 40
        const desc = `${tx('indeks', 'index')} ${i}: ${c.value ?? tx('boş', 'empty')}${st !== 'none' ? ', ' + stateLabel(st) : ''}${c.mark ? ', ' + c.mark : ''}`
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
          {stateLabel(s)}
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

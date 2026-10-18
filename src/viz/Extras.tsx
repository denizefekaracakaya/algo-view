import { useMemo, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { tx } from '../i18n/lang'

/* ───────────── Inversions: every InsertionSort shift removes exactly one ───────────── */

interface Snap {
  /** Element ids in their current order. */
  order: number[]
  /** The pair (by id) whose inversion was removed by the last shift. */
  removed: [number, number] | null
}

function insertionSnaps(values: number[]): Snap[] {
  const order = values.map((_, i) => i)
  const snaps: Snap[] = [{ order: [...order], removed: null }]
  for (let i = 1; i < order.length; i++)
    for (let j = i; j > 0 && values[order[j - 1]] > values[order[j]]; j--) {
      const a = order[j - 1]
      const b = order[j]
      order[j - 1] = b
      order[j] = a
      snaps.push({ order: [...order], removed: [a, b] })
    }
  return snaps
}

const INV_PRESETS = [
  [3, 5, 1, 4, 2],
  [5, 4, 3, 2, 1],
  [1, 2, 4, 3, 5],
  [4, 1, 6, 2, 5, 3],
]

export function InversionArcs() {
  const [values, setValues] = useState(INV_PRESETS[0])
  const [step, setStep] = useState(0)
  const snaps = useMemo(() => insertionSnaps(values), [values])
  const s = snaps[Math.min(step, snaps.length - 1)]
  const W = 54
  const pos = new Map(s.order.map((id, i) => [id, i]))
  const arcs: [number, number][] = []
  for (let i = 0; i < s.order.length; i++) for (let j = i + 1; j < s.order.length; j++) if (values[s.order[i]] > values[s.order[j]]) arcs.push([s.order[i], s.order[j]])
  const total = snaps.length - 1
  const width = values.length * W
  const x = (id: number) => pos.get(id)! * W + W / 2
  const arcPath = (a: number, b: number) => {
    const x1 = x(a)
    const x2 = x(b)
    const h = 16 + Math.abs(x2 - x1) * 0.35
    return `M ${x1} 96 C ${x1} ${96 - h}, ${x2} ${96 - h}, ${x2} 96`
  }
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <span className="small muted">{tx('Dizi', 'Array')}:</span>
        <div className="seg" role="group" aria-label={tx('Hazır diziler', 'Preset arrays')}>
          {INV_PRESETS.map((p) => (
            <button
              key={p.join()}
              aria-pressed={p === values}
              onClick={() => {
                setValues(p)
                setStep(0)
              }}
            >
              {p.join(', ')}
            </button>
          ))}
        </div>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <svg className="inv-svg" viewBox={`0 0 ${width} 150`} width={width} role="img" aria-label={tx(`${arcs.length} ters çift kaldı`, `${arcs.length} inversions left`)}>
            {arcs.map(([a, b]) => {
              const d = arcPath(a, b)
              return <path key={a + '-' + b} className="inv-arc" d={d} style={{ d: `path('${d}')` } as CSSProperties} />
            })}
            {s.removed && <path key={'rm' + step} className="inv-arc removed" d={arcPath(s.removed[1], s.removed[0])} />}
            {values.map((v, id) => (
              <g key={id} className="inv-node" style={{ transform: `translate(${x(id)}px, 118px)` }}>
                <rect x={-20} y={-18} width={40} height={36} rx={8} className={s.removed && s.removed.includes(id) ? 'moved' : ''} />
                <text>{v}</text>
              </g>
            ))}
          </svg>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn icon" onClick={() => setStep(0)} disabled={step === 0} aria-label={tx('Başa sar', 'Reset')}>
              <RotateCcw size={16} aria-hidden />
            </button>
            <button className="btn icon" onClick={() => setStep((k) => Math.max(0, k - 1))} disabled={step === 0} aria-label={tx('Önceki kaydırma', 'Previous shift')}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button className="btn primary" onClick={() => setStep((k) => Math.min(total, k + 1))} disabled={step >= total}>
              {tx('Bir kaydırma yap', 'Do one shift')} <ChevronRight size={16} aria-hidden />
            </button>
          </div>
          <p className="explain" aria-live="polite" style={{ marginTop: 10 }}>
            <span key={step} className="explain-text">
              {step === 0
                ? tx(`Başlangıçta ${arcs.length} ters çift var. Her yay, yanlış sırada duran bir çifti gösterir.`, `At the start there are ${arcs.length} inversions. Each arc is a pair in the wrong order.`)
                : s.removed
                  ? tx(
                      `${values[s.removed[1]]}, ${values[s.removed[0]]}’ın soluna geçti: tam olarak (${values[s.removed[0]]}, ${values[s.removed[1]]}) yayı silindi, başka hiçbir çift değişmedi.`,
                      `${values[s.removed[1]]} moved to the left of ${values[s.removed[0]]}: exactly the arc (${values[s.removed[0]]}, ${values[s.removed[1]]}) was removed and no other pair changed.`,
                    )
                  : ''}
            </span>
          </p>
        </div>
        <aside className="viz-side">
          <dl className="kv" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div>
              <dt>{tx('kalan ters çift', 'inversions left')}</dt>
              <dd>{arcs.length}</dd>
            </div>
            <div>
              <dt>{tx('kaydırma', 'shifts')}</dt>
              <dd>{step}</dd>
            </div>
            <div>
              <dt>{tx('toplam', 'sum')}</dt>
              <dd>{arcs.length + step}</dd>
            </div>
          </dl>
          <p className="small muted" style={{ marginTop: 8 }}>
            {tx(
              'Kalan yaylar ile yapılan kaydırmaların toplamı hiç değişmez: InsertionSort’un kaydırma sayısı tam olarak girdideki ters çift sayısıdır.',
              'Remaining arcs plus shifts done never changes: InsertionSort’s number of shifts is exactly the number of inversions in the input.',
            )}
          </p>
        </aside>
      </div>
    </div>
  )
}

/* ───────────── Rotation: three pointers change, in-order stays the same ───────────── */

type Item = 'x' | 'y' | 'α' | 'β' | 'γ'
const LEFT_HEAVY: Record<Item, [number, number]> = { x: [190, 34], y: [110, 100], α: [62, 170], β: [158, 170], γ: [270, 100] }
const RIGHT_HEAVY: Record<Item, [number, number]> = { y: [190, 34], x: [270, 100], α: [110, 100], β: [222, 170], γ: [318, 170] }

export function RotationDemo() {
  const [rotated, setRotated] = useState(false)
  const P = rotated ? RIGHT_HEAVY : LEFT_HEAVY
  const edges: [Item, Item][] = rotated
    ? [
        ['y', 'α'],
        ['y', 'x'],
        ['x', 'β'],
        ['x', 'γ'],
      ]
    : [
        ['x', 'y'],
        ['x', 'γ'],
        ['y', 'α'],
        ['y', 'β'],
      ]
  const edgeKey = (_a: Item, b: Item) => (b === 'x' || b === 'y' ? 'xy' : b)
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <button className="btn primary" onClick={() => setRotated((r) => !r)}>
          {rotated ? tx('y’de sola rotasyon (geri al)', 'Rotate left at y (undo)') : tx('x’te sağa rotasyon', 'Rotate right at x')}
        </button>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <svg className="rot-svg" viewBox="0 0 380 210" width={380} role="img" aria-label={rotated ? tx('Rotasyondan sonra: y kök, x sağ çocuk', 'After the rotation: y is the root, x its right child') : tx('Rotasyondan önce: x kök, y sol çocuk', 'Before the rotation: x is the root, y its left child')}>
            {edges.map(([a, b]) => {
              const d = `M ${P[a][0]} ${P[a][1]} L ${P[b][0]} ${P[b][1] - (b === 'x' || b === 'y' ? 0 : 14)}`
              return <path key={edgeKey(a, b)} className={'rot-edge' + (b === 'β' ? ' moved' : '')} d={d} style={{ d: `path('${d}')` } as CSSProperties} />
            })}
            {(Object.keys(P) as Item[]).map((k) => {
              const [cx, cy] = P[k]
              const sub = k !== 'x' && k !== 'y'
              return (
                <g key={k} className="rot-node" style={{ transform: `translate(${cx}px, ${cy}px)` }}>
                  {sub ? <path d="M 0 -16 L 22 22 L -22 22 Z" className={'rot-sub' + (k === 'β' ? ' moved' : '')} /> : <circle r={18} />}
                  <text y={sub ? 10 : 0}>{k}</text>
                </g>
              )
            })}
          </svg>
          <p className="mono small" style={{ textAlign: 'center' }}>
            {tx('Sıralı dolaşım', 'In-order')}: α &lt; y &lt; β &lt; x &lt; γ
          </p>
        </div>
        <aside className="viz-side">
          <span className="label-tag">{tx('Değişen işaretçiler', 'Pointers that change')}</span>
          <ol className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>{rotated ? tx('x’in sol çocuğu: y → β', 'left(x): y → β') : tx('başlangıç: left(x) = y', 'start: left(x) = y')}</li>
            <li>{rotated ? tx('y’nin sağ çocuğu: β → x', 'right(y): β → x') : tx('başlangıç: right(y) = β', 'start: right(y) = β')}</li>
            <li>{rotated ? tx('alt ağacın kökü (x’in ebeveynindeki işaretçi): x → y', 'subtree root (pointer in x’s parent): x → y') : tx('başlangıç: alt ağacın kökü x', 'start: the subtree root is x')}</li>
          </ol>
          <p className="small muted" style={{ marginTop: 8 }}>
            {tx(
              'Yalnızca üç işaretçi değişir: O(1). β, y’nin sağından x’in soluna taşınır ama sıralı dolaşım aynı kalır; BST özelliği korunur. Yükseklikler değişir: sol taraf bir seviye yukarı, sağ taraf bir seviye aşağı.',
              'Only three pointers change: O(1). β moves from y’s right to x’s left, but the in-order sequence stays the same; the BST property is preserved. Heights change: the left side moves up a level, the right side down a level.',
            )}
          </p>
        </aside>
      </div>
    </div>
  )
}

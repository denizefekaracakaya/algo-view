import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { Choice, Grid, KV, Seg } from '../components/VizParts'
import { KNAPSACK01_CODE, KNAPSACK_UNB_CODE, LCS_CODE, MWIS_CODE, MWIS_EXAMPLE, NOTES_ITEMS, knapsack01Trace, knapsackUnboundedTrace, lcsTrace, mwisTrace, type Item, type TableState } from '../engines/dp'
import { tx } from '../i18n/lang'

const clean = (s: string) => s.replace(/[^A-Za-z0-9]/g, '').slice(0, 9)

export function LcsViz() {
  const [X, setX] = useState('ABCBDAB')
  const [Y, setY] = useState('BDCABA')
  const [xi, setXi] = useState(X)
  const [yi, setYi] = useState(Y)
  const trace = useMemo(() => lcsTrace(X, Y), [X, Y])
  const toolbar = (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault()
        if (clean(xi) && clean(yi)) {
          setX(clean(xi))
          setY(clean(yi))
        }
      }}
    >
      <label className="field">
        X
        <input className="input mono" style={{ width: 120 }} value={xi} maxLength={9} onChange={(e) => setXi(e.target.value)} />
      </label>
      <label className="field">
        Y
        <input className="input mono" style={{ width: 120 }} value={yi} maxLength={9} onChange={(e) => setYi(e.target.value)} />
      </label>
      <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
        {tx('Uygula', 'Apply')}
      </button>
      <span className="small muted" style={{ alignSelf: 'flex-end' }}>
        {tx('Harf ve rakam, en fazla 9.', 'Letters and digits, at most 9.')}
      </span>
    </form>
  )
  return (
    <TraceViewer
      key={X + '|' + Y}
      trace={trace}
      label={tx('LCS tablosu görselleştirmesi', 'LCS table visualization')}
      code={LCS_CODE}
      toolbar={toolbar}
      render={(step) => <TableView s={step.state} rows={['∅', ...X]} cols={['∅', ...Y]} caption={tx('C[i, j] tablosu', 'Table C[i, j]')} />}
      side={(step) => <KV items={[[tx('LCS', 'LCS'), step.state.result === null ? '…' : `“${step.state.result}”`]]} />}
      legend={<span className="muted">{tx('Sarı: hesaplanan hücre; mavi: kullandığı hücre; yeşil: geri izleme yolu.', 'Yellow: the cell being computed; blue: the cell it uses; green: the traceback path.')}</span>}
    />
  )
}

function TableView({ s, rows, cols, caption }: { s: TableState; rows: string[]; cols: string[]; caption: string }) {
  return (
    <Grid
      caption={caption}
      colHead={cols}
      rowHead={rows}
      cells={s.table.map((r) => r.map((c) => (c === null ? '' : String(c))))}
      tone={(i, j) =>
        s.cell && s.cell[0] === i && s.cell[1] === j ? 'cur' : s.from.some(([a, b]) => a === i && b === j) ? 'from' : s.path.some(([a, b]) => a === i && b === j) ? 'path' : undefined
      }
    />
  )
}

const ITEM_SETS = (): Record<string, { items: Item[]; W: number; label: string }> => ({
  notes: { items: NOTES_ITEMS, W: 10, label: tx('Notlardaki örnek (W = 10)', 'Notes example (W = 10)') },
  greedyFails: {
    items: [
      { name: 'P', w: 5, v: 10 },
      { name: 'Q', w: 4, v: 7 },
      { name: 'R', w: 4, v: 7 },
    ],
    W: 8,
    label: tx('Oran açgözlüsü yanılır (W = 8)', 'Ratio-greedy fails (W = 8)'),
  },
})

export function KnapsackViz() {
  const [variant, setVariant] = useState<'01' | 'unb'>('01')
  const [set, setSet] = useState('notes')
  const S = ITEM_SETS()
  const { items, W } = S[set]
  const trace = useMemo(() => (variant === '01' ? knapsack01Trace(items, W) : knapsackUnboundedTrace(items, W)), [variant, items, W])
  return (
    <TraceViewer
      key={variant + set}
      trace={trace}
      label={tx('Sırt çantası tablosu görselleştirmesi', 'Knapsack table visualization')}
      code={variant === '01' ? KNAPSACK01_CODE : KNAPSACK_UNB_CODE}
      toolbar={
        <>
          <Seg
            label={tx('Çeşit', 'Variant')}
            value={variant}
            onChange={setVariant}
            options={[
              { value: '01', label: tx('0/1 (her eşyadan bir)', '0/1 (one of each)') },
              { value: 'unb', label: tx('Sınırsız kopya', 'Unbounded') },
            ]}
          />
          <Choice label={tx('Eşyalar', 'Items')} value={set} onChange={setSet} options={Object.entries(S).map(([k, v]) => ({ value: k, label: v.label }))} />
        </>
      }
      render={(step) => (
        <div className="stack">
          <div className="small mono">{items.map((it) => `${it.name}: w=${it.w}, v=${it.v}`).join(' · ')}</div>
          <TableView
            s={step.state}
            rows={variant === '01' ? ['∅', ...items.map((it) => it.name)] : ['K']}
            cols={Array.from({ length: W + 1 }, (_, x) => String(x))}
            caption={variant === '01' ? tx('K[x, j]: satır j = ilk j eşya, sütun x = kapasite', 'K[x, j]: row j = first j items, column x = capacity') : tx('K[x]: sütun x = kapasite', 'K[x]: column x = capacity')}
          />
        </div>
      )}
      side={(step) => <KV items={[[tx('seçilenler', 'chosen'), step.state.result === null ? '…' : `{${step.state.result}}`]]} />}
      legend={<span className="muted">{tx('Sütunlar kapasite x. Sarı: hesaplanan hücre; mavi: “alma” ve “al” seçeneklerinin baktığı hücreler; yeşil: geri izleme.', 'Columns are capacities x. Yellow: the cell being computed; blue: the cells read by the “skip” and “take” options; green: the traceback.')}</span>}
    />
  )
}

export function MwisViz() {
  const t = MWIS_EXAMPLE
  const { trace } = useMemo(() => mwisTrace(t), [t])
  // Simple layered layout of the rooted tree.
  const levels: string[][] = []
  const walk = (u: string, d: number) => {
    ;(levels[d] ??= []).push(u)
    for (const v of t.children[u]) walk(v, d + 1)
  }
  walk(t.root, 0)
  const pos: Record<string, { x: number; y: number }> = {}
  levels.forEach((lv, d) => lv.forEach((u, i) => (pos[u] = { x: ((i + 1) / (lv.length + 1)) * 520 + 20, y: 34 + d * 78 })))
  const edges = Object.entries(t.children).flatMap(([u, cs]) => cs.map((v) => [u, v]))
  return (
    <TraceViewer
      trace={trace}
      label={tx('Ağaçta bağımsız küme görselleştirmesi', 'Independent set in a tree visualization')}
      code={MWIS_CODE}
      render={(step) => {
        const s = step.state
        return (
          <svg className="graph-svg" viewBox={`0 0 560 ${levels.length * 78 + 20}`} role="img" aria-label={tx('Ağırlıklı ağaç; düğüm: ağırlık, A, B', 'Weighted tree; node: weight, A, B') + '. ' + Object.keys(t.weight).map((u) => `${u} w=${t.weight[u]} A=${s.A[u] ?? '?'} B=${s.B[u] ?? '?'}`).join('; ')}>
            {edges.map(([u, v]) => (
              <line key={u + v} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke="var(--border-strong)" strokeWidth={2} />
            ))}
            {Object.keys(t.weight).map((u) => {
              const chosen = s.chosen.includes(u)
              const cur = s.current === u
              const solved = s.A[u] !== null
              return (
                <g key={u} transform={`translate(${pos[u].x}, ${pos[u].y})`}>
                  <circle r={18} fill={chosen ? 'var(--st-sorted-bg)' : cur ? 'var(--st-compare-bg)' : solved ? 'var(--st-less-bg)' : 'var(--surface)'} stroke={chosen ? 'var(--st-sorted)' : cur ? 'var(--st-compare)' : solved ? 'var(--st-less)' : 'var(--border-strong)'} strokeWidth={2.4} />
                  <text className="g-id" textAnchor="middle" dy="-1">
                    {u}
                  </text>
                  <text className="g-sub" textAnchor="middle" dy="12">
                    {t.weight[u]}
                  </text>
                  {solved && (
                    <text className="g-sub" textAnchor="middle" y={34}>
                      A={s.A[u]} B={s.B[u]}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )
      }}
      side={(step) => <KV items={[[tx('küme', 'set'), step.state.chosen.length ? '{' + step.state.chosen.join(', ') + '}' : '…']]} />}
      legend={<span className="muted">{tx('Düğümün altındaki sayı ağırlığıdır. A(u): T_u’daki en iyi küme; B(u): u’yu içermeyen en iyi küme. Yeşil: sonuçtaki küme. Ağaç kendi örneğimizdir.', 'The number in a node is its weight. A(u): the best set in T_u; B(u): the best set that leaves u out. Green: the final set. The tree is our own example.')}</span>}
    />
  )
}

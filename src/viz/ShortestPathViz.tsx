import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { GraphView, type Tone } from '../components/GraphView'
import { Choice, Grid, KV, Legend } from '../components/VizParts'
import { DIJKSTRA_EXAMPLE, FLOYD_EXAMPLE, NEGATIVE_CYCLE_EXAMPLE, NEGATIVE_EDGE_EXAMPLE, ids, type Graph } from '../engines/graph'
import { BELLMAN_FORD_CODE, DIJKSTRA_CODE, FLOYD_CODE, bellmanFordTrace, dijkstraTrace, floydTrace, fmt } from '../engines/shortestPaths'
import { tx } from '../i18n/lang'

const presets = (): Record<string, { g: Graph; label: string }> => ({
  pos: { g: DIJKSTRA_EXAMPLE, label: tx('Negatif olmayan ağırlıklar', 'Non-negative weights') },
  neg: { g: NEGATIVE_EDGE_EXAMPLE, label: tx('Bir negatif kenar', 'One negative edge') },
  cycle: { g: NEGATIVE_CYCLE_EXAMPLE, label: tx('Negatif döngü', 'Negative cycle') },
})

export function DijkstraViz() {
  const [key, setKey] = useState('pos')
  const P = presets()
  const g = P[key].g
  const { trace } = useMemo(() => dijkstraTrace(g, 's'), [g])
  const truth = useMemo(() => bellmanFordTrace(g, 's'), [g])
  return (
    <TraceViewer
      key={key}
      trace={trace}
      label={tx('Dijkstra görselleştirmesi', 'Dijkstra visualization')}
      code={DIJKSTRA_CODE}
      toolbar={<Choice label={tx('Grafik', 'Graph')} value={key} onChange={setKey} options={Object.entries(P).filter(([k]) => k !== 'cycle').map(([k, v]) => ({ value: k, label: v.label }))} />}
      render={(step) => {
        const s = step.state
        const tone = (v: string): Tone => (s.current === v ? 'active' : s.done.includes(v) ? 'done' : s.d[v] < Infinity ? 'frontier' : 'default')
        return (
          <GraphView
            graph={g}
            label={tx('Ağırlıklı yönlü grafik', 'Weighted directed graph')}
            node={(v) => ({ tone: tone(v), sub: 'd=' + fmt(s.d[v]), tag: v === 's' ? 's' : undefined })}
            edge={(e, i) => ({ tone: s.relaxing === i ? 'active' : s.tree.includes(i) ? 'tree' : (e.w ?? 0) < 0 ? 'bad' : 'default' })}
          />
        )
      }}
      side={(step) => (
        <div className="stack">
          <KV items={[[tx('D (kesin)', 'D (final)'), step.state.done.join(', ') || '—']]} />
          {key === 'neg' && (
            <p className="small" style={{ margin: 0, color: 'var(--st-bad)' }}>
              {tx(
                `Gerçek uzaklıklar (Bellman–Ford): ${ids(g).map((v) => `${v}: ${fmt(truth.d[v])}`).join(', ')}. Dijkstra a’yı erken kesinleştiriyor; negatif kenar, kanıttaki “w ≥ 0” adımını bozar.`,
                `True distances (Bellman–Ford): ${ids(g).map((v) => `${v}: ${fmt(truth.d[v])}`).join(', ')}. Dijkstra finalizes a too early; the negative edge breaks the “w ≥ 0” step of the proof.`,
              )}
            </p>
          )}
        </div>
      )}
      legend={
        <Legend
          items={[
            { color: 'var(--st-sorted-bg)', border: 'var(--st-sorted)', label: tx('D: kesinleşti', 'D: finalized') },
            { color: 'var(--st-less-bg)', border: 'var(--st-less)', label: tx('F: tahmini sonlu', 'F: finite estimate') },
            { color: 'var(--st-compare-bg)', border: 'var(--st-compare)', label: tx('seçilen / gevşetilen', 'chosen / being relaxed') },
          ]}
        />
      }
    />
  )
}

export function BellmanFordViz() {
  const [key, setKey] = useState('pos')
  const P = presets()
  const g = P[key].g
  const { trace } = useMemo(() => bellmanFordTrace(g, 's'), [g])
  const V = ids(g)
  return (
    <TraceViewer
      key={key}
      trace={trace}
      label={tx('Bellman–Ford görselleştirmesi', 'Bellman–Ford visualization')}
      code={BELLMAN_FORD_CODE}
      toolbar={<Choice label={tx('Grafik', 'Graph')} value={key} onChange={setKey} options={Object.entries(P).map(([k, v]) => ({ value: k, label: v.label }))} />}
      render={(step) => {
        const s = step.state
        const last = s.rows[s.rows.length - 1]
        return (
          <div className="stack">
            <GraphView
              graph={g}
              height={240}
              label={tx('Ağırlıklı yönlü grafik', 'Weighted directed graph')}
              node={(v) => ({ tone: s.changed === v ? 'active' : last[v] < Infinity ? 'frontier' : 'default', sub: fmt(last[v]), tag: v === 's' ? 's' : undefined })}
              edge={(e, i) => ({ tone: s.edge === i ? (s.negativeCycle ? 'bad' : 'active') : (e.w ?? 0) < 0 ? 'bad' : 'default' })}
            />
            <Grid
              caption={tx('d(k)[v] tablosu', 'Table d(k)[v]')}
              corner="k"
              colHead={V}
              rowHead={s.rows.map((_, k) => k)}
              cells={s.rows.map((r) => V.map((v) => fmt(r[v])))}
              tone={(i, j) => (i === s.rows.length - 1 && V[j] === s.changed ? 'cur' : i > 0 && s.rows[i][V[j]] !== s.rows[i - 1][V[j]] ? 'hl' : undefined)}
            />
          </div>
        )
      }}
      side={(step) => (
        <KV
          items={[
            ['k', step.state.k],
            [tx('negatif döngü', 'negative cycle'), step.state.negativeCycle === null ? '?' : step.state.negativeCycle ? tx('var', 'yes') : tx('yok', 'no')],
          ]}
        />
      )}
      legend={<span className="muted">{tx('Satır k: en fazla k kenarlı yollarla elde edilen en iyi uzaklıklar. Sarı: o turda iyileşen hücre.', 'Row k: the best distances using paths with at most k edges. Yellow: a cell that improved in that round.')}</span>}
    />
  )
}

export function FloydViz() {
  const g = FLOYD_EXAMPLE
  const { trace } = useMemo(() => floydTrace(g), [g])
  const V = ids(g)
  return (
    <TraceViewer
      trace={trace}
      label={tx('Floyd–Warshall görselleştirmesi', 'Floyd–Warshall visualization')}
      code={FLOYD_CODE}
      render={(step) => {
        const s = step.state
        const k = s.k > 0 ? V[s.k - 1] : null
        return (
          <div className="stack">
            <GraphView
              graph={g}
              height={220}
              label={tx('Ağırlıklı yönlü grafik', 'Weighted directed graph')}
              node={(v) => ({ tone: v === k ? 'pivot' : s.cell && (V[s.cell[0]] === v || V[s.cell[1]] === v) ? 'active' : V.indexOf(v) < s.k ? 'done' : 'default' })}
              edge={(e) => ({ tone: (e.w ?? 0) < 0 ? 'bad' : 'default' })}
            />
            <Grid
              caption={tx(`d${s.k} matrisi`, `Matrix d${s.k}`)}
              corner={`d${s.k}`}
              colHead={V}
              rowHead={V}
              cells={s.matrix.map((r) => r.map(fmt))}
              tone={(i, j) => (s.cell && s.cell[0] === i && s.cell[1] === j ? 'cur' : s.improved.some(([a, b]) => a === i && b === j) ? 'hl' : k !== null && (V[i] === k || V[j] === k) ? 'from' : undefined)}
            />
          </div>
        )
      }}
      side={(step) => <KV items={[[tx('ara düğümler', 'intermediates'), step.state.k ? '{' + V.slice(0, step.state.k).join(', ') + '}' : '∅']]} />}
      legend={<span className="muted">{tx('Mor düğüm: bu turda ara düğüm olarak eklenen k. Mavi hücreler: k satırı ve sütunu (yeni değerler bunlardan hesaplanır). Sarı: iyileşen hücre.', 'Purple node: the k added as an intermediate node in this round. Blue cells: row and column k (new values are computed from them). Yellow: an improved cell.')}</span>}
    />
  )
}

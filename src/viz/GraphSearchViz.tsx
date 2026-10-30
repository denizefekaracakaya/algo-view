import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { GraphView, type Tone } from '../components/GraphView'
import { Choice, KV, Legend, Seg } from '../components/VizParts'
import { BFS_EXAMPLE, COMPONENTS_EXAMPLE, DAG_EXAMPLE, DFS_EXAMPLE, SCC_EXAMPLE, ids, type Graph } from '../engines/graph'
import { BFS_CODE, DFS_CODE, bfsTrace, dfsTrace, type SearchState } from '../engines/graphSearch'
import { SCC_CODE, sccTrace } from '../engines/scc'
import { tx } from '../i18n/lang'

type Mode = 'bfs' | 'dfs' | 'components' | 'topo'

const graphs = (): Record<string, { g: Graph; label: string }> => ({
  bfs: { g: BFS_EXAMPLE, label: tx('Katmanlı (yönsüz)', 'Layered (undirected)') },
  dfs: { g: DFS_EXAMPLE, label: tx('Notlardaki DFS örneği (yönlü)', 'Notes’ DFS example (directed)') },
  comp: { g: COMPONENTS_EXAMPLE, label: tx('Üç bileşen (yönsüz)', 'Three components (undirected)') },
  dag: { g: DAG_EXAMPLE, label: tx('Döngüsüz yönlü (DAG)', 'Directed acyclic (DAG)') },
})

const GROUPS: Tone[] = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5']

export function GraphSearchViz({ initial = 'bfs' }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial)
  const defaults: Record<Mode, string> = { bfs: 'bfs', dfs: 'dfs', components: 'comp', topo: 'dag' }
  const [gKey, setGKey] = useState(defaults[initial])
  const G = graphs()
  const g = G[gKey].g
  const [source, setSource] = useState(ids(g)[0])
  const src = ids(g).includes(source) ? source : ids(g)[0]
  const trace = useMemo(() => (mode === 'bfs' ? bfsTrace(g, src) : dfsTrace(g, mode === 'dfs' ? 'dfs' : mode)), [g, mode, src])
  const toolbar = (
    <>
      <Seg
        label={tx('Algoritma', 'Algorithm')}
        value={mode}
        onChange={(m) => {
          setMode(m)
          setGKey(defaults[m])
        }}
        options={[
          { value: 'bfs', label: 'BFS' },
          { value: 'dfs', label: 'DFS' },
          { value: 'components', label: tx('Bileşenler', 'Components') },
          { value: 'topo', label: tx('Topolojik sıra', 'Topological order') },
        ]}
      />
      <Choice label={tx('Grafik', 'Graph')} value={gKey} onChange={setGKey} options={Object.entries(G).map(([k, v]) => ({ value: k, label: v.label }))} />
      {mode === 'bfs' && <Choice label={tx('Kaynak s', 'Source s')} value={src} onChange={setSource} options={ids(g).map((v) => ({ value: v, label: v }))} />}
    </>
  )
  const render = (s: SearchState) => {
    const tone = (v: string): Tone => {
      if (mode === 'components' && s.comp[v] !== null) return s.color[v] === 'black' ? GROUPS[s.comp[v]! % 6] : 'active'
      if (s.current === v) return 'active'
      return s.color[v] === 'gray' ? 'frontier' : s.color[v] === 'black' ? 'done' : 'default'
    }
    const sub = (v: string) => {
      if (mode === 'bfs') return s.layer[v] !== null ? `L${s.layer[v]}` : ''
      if (s.d[v] === null) return ''
      return `${s.d[v]}/${s.f[v] ?? '·'}`
    }
    return (
      <div className="stack">
        <GraphView
          graph={g}
          label={tx('Grafik', 'Graph')}
          node={(v) => ({ tone: tone(v), sub: sub(v), tag: mode === 'bfs' && v === src ? 's' : undefined })}
          edge={(_, i) => ({ tone: s.scanning === i ? 'active' : s.tree.includes(i) ? 'tree' : 'default' })}
        />
        {mode === 'bfs' ? (
          <div className="small mono">
            {tx('Şu anki katman', 'Current layer')}: [{s.queue[0]?.join(', ') ?? ''}] · {tx('sonraki', 'next')}: [{s.queue[1]?.join(', ') ?? ''}]
          </div>
        ) : (
          <div className="small mono">
            {tx('Özyineleme yığını', 'Recursion stack')}: [{s.stack.join(' → ')}]{mode === 'topo' && <> · {tx('sıra', 'order')}: [{s.order.join(', ')}]</>}
          </div>
        )}
      </div>
    )
  }
  return (
    <TraceViewer
      key={mode + gKey + src}
      trace={trace}
      label={tx('Grafik arama görselleştirmesi', 'Graph search visualization') + ` (${initial === 'bfs' ? 'BFS' : initial === 'dfs' ? 'DFS' : initial === 'components' ? tx('bileşenler', 'components') : tx('topolojik sıra', 'topological order')})`}
      toolbar={toolbar}
      code={mode === 'bfs' ? BFS_CODE : DFS_CODE}
      render={(step) => render(step.state)}
      side={(step) => (
        <KV
          items={[
            [tx('keşfedilen', 'discovered'), ids(g).filter((v) => step.state.color[v] !== 'white').length + ' / ' + ids(g).length],
            [tx('ağaç kenarı', 'tree edges'), step.state.tree.length],
            ...(mode === 'components' ? ([[tx('bileşen', 'components'), new Set(Object.values(step.state.comp).filter((c) => c !== null)).size]] as [string, number][]) : []),
          ]}
        />
      )}
      legend={
        <Legend
          items={[
            { color: 'var(--surface)', border: 'var(--border-strong)', label: tx('beyaz: keşfedilmedi', 'white: undiscovered') },
            { color: 'var(--st-less-bg)', border: 'var(--st-less)', label: mode === 'bfs' ? tx('kuyrukta / katmanda', 'in a layer') : tx('gri: yığında', 'gray: on the stack') },
            { color: 'var(--st-sorted-bg)', border: 'var(--st-sorted)', label: tx('siyah: bitti', 'black: finished') },
            { color: 'var(--st-compare-bg)', border: 'var(--st-compare)', label: tx('işlenen düğüm / taranan kenar', 'node in progress / edge being scanned') },
          ]}
        />
      }
    />
  )
}

export function SccViz() {
  const g = SCC_EXAMPLE
  const trace = useMemo(() => sccTrace(g).trace, [g])
  const leaders = [...new Set(Object.values(trace.at(-1)!.state.leader))]
  return (
    <TraceViewer
      trace={trace}
      label={tx('Güçlü bağlı bileşenler görselleştirmesi', 'Strongly connected components visualization')}
      code={SCC_CODE}
      render={(step) => {
        const s = step.state
        const shown: Graph = s.pass === 1 ? { ...g, edges: g.edges.map((e) => ({ ...e, u: e.v, v: e.u })) } : g
        const tone = (v: string): Tone => {
          if (s.current === v) return 'active'
          if (s.pass === 2 && s.leader[v]) return GROUPS[leaders.indexOf(s.leader[v]!) % 6]
          return s.explored[v] ? 'done' : 'default'
        }
        return (
          <div className="stack">
            <span className="badge accent">{s.pass === 1 ? tx('1. geçiş: ters grafik Grev', 'Pass 1: reversed graph Grev') : tx('2. geçiş: asıl grafik G', 'Pass 2: original graph G')}</span>
            <GraphView
              graph={shown}
              label={tx('Yönlü grafik', 'Directed graph')}
              node={(v) => ({ tone: tone(v), sub: s.f[v] !== null ? `f=${s.f[v]}` : '', tag: s.pass === 2 && s.leader[v] === v ? '★' : undefined })}
              edge={(_, i) => ({ tone: s.scanning === i ? 'active' : 'default' })}
            />
            <div className="small mono">
              {s.pass === 2 && s.order.length > 0 && (
                <>
                  {tx('İşleme sırası (f azalan)', 'Processing order (decreasing f)')}: {s.order.join(', ')}
                </>
              )}
            </div>
          </div>
        )
      }}
      side={(step) => (
        <KV
          items={[
            [tx('geçiş', 'pass'), step.state.pass],
            [tx('lider sayısı', 'leaders'), new Set(Object.values(step.state.leader).filter(Boolean)).size],
          ]}
        />
      )}
      legend={
        <span className="muted">
          {tx(
            'f = 1. geçişteki bitiş zamanı. 2. geçişte her renk bir SCC’dir; ★ o bileşenin lideri (DFS’in başladığı düğüm). Grafik kendi örneğimizdir: dört SCC {a,b,c}, {d,e}, {f,g,h}, {i}.',
            'f = finishing time from pass 1. In pass 2 each color is one SCC; ★ marks its leader (where the DFS started). The graph is our own example: four SCCs {a,b,c}, {d,e}, {f,g,h}, {i}.',
          )}
        </span>
      }
    />
  )
}

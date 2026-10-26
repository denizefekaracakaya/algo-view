import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { GraphView, type Tone } from '../components/GraphView'
import { Choice, KV, Legend, Seg } from '../components/VizParts'
import { MST_EXAMPLE, MST_SMALL, ids } from '../engines/graph'
import { KRUSKAL_CODE, PRIM_CODE, kruskalTrace, primTrace } from '../engines/mst'
import { tx } from '../i18n/lang'

const GROUPS: Tone[] = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5']

export function MSTViz() {
  const [algo, setAlgo] = useState<'prim' | 'kruskal'>('kruskal')
  const [key, setKey] = useState<'notes' | 'small'>('notes')
  const g = key === 'notes' ? MST_EXAMPLE : MST_SMALL
  const trace = useMemo(() => (algo === 'prim' ? primTrace(g, 'a') : kruskalTrace(g)).trace, [algo, g])
  return (
    <TraceViewer
      key={algo + key}
      trace={trace}
      label={tx('Minimum yayılan ağaç görselleştirmesi', 'Minimum spanning tree visualization')}
      code={algo === 'prim' ? PRIM_CODE : KRUSKAL_CODE}
      toolbar={
        <>
          <Seg label={tx('Algoritma', 'Algorithm')} value={algo} onChange={setAlgo} options={[{ value: 'kruskal', label: 'Kruskal' }, { value: 'prim', label: 'Prim' }]} />
          <Choice
            label={tx('Grafik', 'Graph')}
            value={key}
            onChange={setKey}
            options={[
              { value: 'notes', label: tx('Notlardaki örnek (a…i)', 'Notes example (a…i)') },
              { value: 'small', label: tx('Küçük örnek', 'Small example') },
            ]}
          />
        </>
      }
      render={(step) => {
        const s = step.state
        const groupOf = (v: string) => s.sets.findIndex((c) => c.includes(v))
        const tone = (v: string): Tone => {
          if (s.current === v) return 'active'
          if (algo === 'prim') return s.inTree.includes(v) ? 'done' : s.key[v] < Infinity ? 'frontier' : 'default'
          const gi = groupOf(v)
          return gi >= 0 && s.sets[gi].length > 1 ? GROUPS[gi % 6] : 'default'
        }
        return (
          <GraphView
            graph={g}
            label={tx('Ağırlıklı yönsüz grafik', 'Weighted undirected graph')}
            node={(v) => ({ tone: tone(v), sub: algo === 'prim' && !s.inTree.includes(v) ? (s.key[v] === Infinity ? 'key ∞' : `key ${s.key[v]}`) : undefined })}
            edge={(_, i) => ({ tone: s.edge === i ? 'active' : s.tree.includes(i) ? 'tree' : s.rejected.includes(i) ? 'muted' : 'default', dashed: s.rejected.includes(i) })}
          />
        )
      }}
      side={(step) => (
        <div className="stack">
          <KV items={[[tx('kenar', 'edges'), `${step.state.tree.length} / ${ids(g).length - 1}`]]} />
          {algo === 'kruskal' && (
            <div className="small mono" style={{ overflowWrap: 'anywhere' }}>
              {step.state.sets.map((c) => '{' + c.join(',') + '}').join(' ')}
            </div>
          )}
        </div>
      )}
      legend={
        <Legend
          items={[
            { color: 'var(--st-sorted)', label: tx('ağaçtaki kenar', 'tree edge') },
            { color: 'var(--st-compare)', label: tx('incelenen kenar', 'edge being examined') },
            { color: 'var(--surface-3)', label: tx('atlanan kenar (döngü)', 'skipped edge (cycle)') },
            ...(algo === 'kruskal' ? [{ color: 'var(--st-less-bg)', border: 'var(--st-less)', label: tx('aynı renk = aynı küme', 'same color = same set') }] : [{ color: 'var(--st-less-bg)', border: 'var(--st-less)', label: tx('Q’da, anahtarı sonlu', 'in Q with a finite key') }]),
          ]}
        />
      }
    />
  )
}

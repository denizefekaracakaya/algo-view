import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { GraphView } from '../components/GraphView'
import { Choice, KV, Legend, Seg } from '../components/VizParts'
import { FLOW_EXAMPLE, FLOW_ZIGZAG, MATCHING_FLOW, type Graph } from '../engines/graph'
import { FF_CODE, fordFulkersonTrace, residualEdges, type PathRule } from '../engines/maxFlow'
import { tx } from '../i18n/lang'

const NETS = (): Record<string, { g: Graph; label: string }> => ({
  classic: { g: FLOW_EXAMPLE, label: tx('Klasik ağ (maks. 23)', 'Classic network (max 23)') },
  zigzag: { g: FLOW_ZIGZAG, label: tx('Kötü yol seçimi tuzağı', 'Bad path choice trap') },
  matching: { g: MATCHING_FLOW, label: tx('İki parçalı eşleştirme', 'Bipartite matching') },
})

export function MaxFlowViz() {
  const [key, setKey] = useState('classic')
  const [rule, setRule] = useState<PathRule>('bfs')
  const [residual, setResidual] = useState(false)
  const N = NETS()
  const g = N[key].g
  const { trace } = useMemo(() => fordFulkersonTrace(g, 's', 't', rule), [g, rule])
  return (
    <TraceViewer
      key={key + rule}
      trace={trace}
      label={tx('Ford–Fulkerson görselleştirmesi', 'Ford–Fulkerson visualization')}
      code={FF_CODE}
      toolbar={
        <>
          <Choice label={tx('Ağ', 'Network')} value={key} onChange={setKey} options={Object.entries(N).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Seg
            label={tx('Yol seçimi', 'Path choice')}
            value={rule}
            onChange={setRule}
            options={[
              { value: 'bfs', label: tx('BFS (en kısa)', 'BFS (shortest)') },
              { value: 'dfs', label: 'DFS' },
            ]}
          />
          <label className="row small" style={{ alignSelf: 'flex-end' }}>
            <input type="checkbox" checked={residual} onChange={(e) => setResidual(e.target.checked)} /> {tx('Artık grafiği göster', 'Show the residual graph')}
          </label>
        </>
      }
      render={(step) => {
        const s = step.state
        const showRes = residual || s.showResidual
        const onPath = (i: number, forward: boolean) => !!s.path?.some((r) => r.e === i && r.forward === forward)
        const cut = s.cut ? new Set(s.cut) : null
        if (showRes) {
          const res = residualEdges(g, s.flow)
          const hasBoth = (i: number) => res.filter((r) => r.e === i).length === 2
          return (
            <div className="stack">
              <span className="badge accent">{tx('Artık grafik Gf', 'Residual graph Gf')}</span>
              <GraphView
                graph={{ ...g, edges: [] }}
                label={tx('Artık grafik', 'Residual graph')}
                node={(v) => ({ tone: cut ? (cut.has(v) ? 'g0' : 'g1') : v === 's' || v === 't' ? 'pivot' : 'default' })}
                extra={res.map((r) => ({
                  e: { u: r.u, v: r.v, w: r.cap },
                  look: { tone: onPath(r.e, r.forward) ? 'active' : r.forward ? 'default' : 'pivot', dashed: !r.forward, bend: hasBoth(r.e) ? (r.forward ? 14 : 14) : 0 },
                }))}
              />
            </div>
          )
        }
        return (
          <GraphView
            graph={g}
            label={tx('Akış ağı; kenar etiketi akış/kapasite', 'Flow network; edge label flow/capacity')}
            node={(v) => ({ tone: cut ? (cut.has(v) ? 'g0' : 'g1') : v === 's' || v === 't' ? 'pivot' : 'default' })}
            edge={(e, i) => ({
              label: `${s.flow[i]}/${e.w}`,
              tone: onPath(i, true) || onPath(i, false) ? 'active' : cut && cut.has(e.u) && !cut.has(e.v) ? 'bad' : s.flow[i] === e.w ? 'tree' : 'default',
            })}
          />
        )
      }}
      side={(step) => (
        <KV
          items={[
            [tx('darboğaz', 'bottleneck'), step.state.bottleneck ?? '—'],
            ...(step.state.cut ? ([['S', '{' + step.state.cut.join(', ') + '}']] as [string, string][]) : []),
          ]}
        />
      )}
      legend={
        <Legend
          items={[
            { color: 'var(--st-compare)', label: tx('artırıcı yol', 'augmenting path') },
            { color: 'var(--st-sorted)', label: tx('dolu kenar (akış = kapasite)', 'saturated edge (flow = capacity)') },
            { color: 'var(--st-pivot)', label: tx('artık grafikte ters kenar (kesikli)', 'backward residual edge (dashed)') },
            { color: 'var(--st-bad)', label: tx('sonda: minimum kesmeyi geçen kenar', 'at the end: edge crossing the min cut') },
          ]}
        />
      }
    />
  )
}

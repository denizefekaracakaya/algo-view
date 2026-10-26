import { useMemo, useState, type ReactNode } from 'react'
import { ArrayView, type CellSpec } from '../components/ArrayView'
import { TreeView } from '../components/TreeView'
import type { NodeRole } from '../engines/bst'
import { tx } from '../i18n/lang'
import { bstDrill, drillInput, insertionDrill, mergeDrill, momDrill, partitionDrill, radixDrill, type DrillId } from './drills'
import { useDrill, type DrillProps } from './useDrill'
import { DrillFrame } from './DrillFrame'
import { BfsDrillView, DfsDrillView, DijkstraDrillView, GsDrillView, HashDrillView, HuffmanDrillView, KruskalDrillView, LcsDrillView } from './HandTraceLater'

/** Remount on restart so the step machine resets with the same input. */
function Restartable({ render }: { render: (restart: () => void) => ReactNode }) {
  const [run, setRun] = useState(0)
  return <div key={run}>{render(() => setRun((r) => r + 1))}</div>
}

function InsertionDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { steps, final } = useMemo(() => insertionDrill(drillInput('insertion', seed)), [seed])
  const d = useDrill(steps, 'insertion')
  const s = d.step
  const arr = s ? s.array : final
  const cells: CellSpec[] = arr.map((v, k) => ({ value: v, state: !s ? 'sorted' : k === s.i ? 'active' : k < s.i ? 'sorted' : 'none', mark: s && k === s.i ? 'current' : undefined }))
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={<ArrayView cells={cells} label={tx('Dizi', 'Array')} />}
      prompt={s && tx(`current = ${s.current}. Sıralı kısım A[0…${s.i - 1}]. current hangi indekse yerleşir?`, `current = ${s.current}. The sorted part is A[0…${s.i - 1}]. At which index does current land?`)}
      controls={
        s &&
        Array.from({ length: s.i + 1 }, (_, k) => (
          <button key={k} className="btn sm mono" onClick={() => d.choose(k)} aria-label={tx(`İndeks ${k}`, `Index ${k}`)}>
            {k}
          </button>
        ))
      }
    />
  )
}

function MergeDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { L, R } = useMemo(() => {
    const A = drillInput('merge', seed)
    return { L: A.slice(0, 4).sort((x, y) => x - y), R: A.slice(4).sort((x, y) => x - y) }
  }, [seed])
  const { steps, final } = useMemo(() => mergeDrill(L, R), [L, R])
  const d = useDrill(steps, 'merge')
  const s = d.step
  const list = (xs: number[], head: number | null, name: string): CellSpec[] =>
    xs.map((v, k) => ({ value: v, state: head === null || k < head ? 'elim' : k === head ? 'compare' : 'none', mark: k === head ? name : undefined }))
  const S = s ? s.S : final
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <div className="drill-row">
            <span className="mono drill-label">L</span>
            <ArrayView cells={list(L, s ? s.i : null, 'i')} bars={false} label="L" />
          </div>
          <div className="drill-row">
            <span className="mono drill-label">R</span>
            <ArrayView cells={list(R, s ? s.j : null, 'j')} bars={false} label="R" />
          </div>
          <div className="drill-row">
            <span className="mono drill-label">S</span>
            {S.length ? <ArrayView cells={S.map((v) => ({ value: v, state: 'sorted' }))} bars={false} label="S" /> : <span className="muted small">{tx('(boş)', '(empty)')}</span>}
          </div>
        </div>
      }
      prompt={s && tx('S’e sıradaki eleman hangisi?', 'Which element is appended to S next?')}
      controls={
        s && (
          <>
            <button className="btn sm" onClick={() => d.choose(0)}>
              {tx('L’den', 'From L:')} {s.L[s.i]}
            </button>
            <button className="btn sm" onClick={() => d.choose(1)}>
              {tx('R’den', 'From R:')} {s.R[s.j]}
            </button>
          </>
        )
      }
    />
  )
}

function PartitionDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { steps, final, pivotIndex } = useMemo(() => partitionDrill(drillInput('partition', seed)), [seed])
  const d = useDrill(steps, 'partition')
  const s = d.step
  const hi = final.length - 1
  const cells: CellSpec[] = s
    ? s.array.map((v, k) => ({
        value: v,
        state: k === hi ? 'pivot' : k < s.i ? 'less' : s.kind === 'compare' && k === s.j ? 'compare' : k < s.j || s.kind === 'place' ? 'greater' : 'none',
        mark: [k === s.i ? 'i' : '', s.kind === 'compare' && k === s.j ? 'j' : ''].filter(Boolean).join(',') || undefined,
      }))
    : final.map((v, k) => ({ value: v, state: k === pivotIndex ? 'pivot' : k < pivotIndex ? 'less' : 'greater' }))
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={<ArrayView cells={cells} label={tx('Dizi', 'Array')} />}
      prompt={
        s &&
        (s.kind === 'compare'
          ? tx(`Pivot = ${s.array[hi]}, A[j] = ${s.array[s.j]} (j = ${s.j}, i = ${s.i}). Ne olur?`, `Pivot = ${s.array[hi]}, A[j] = ${s.array[s.j]} (j = ${s.j}, i = ${s.i}). What happens?`)
          : tx('Döngü bitti. Pivot hangi indekse taşınır?', 'The loop is over. To which index does the pivot move?'))
      }
      controls={
        s &&
        (s.kind === 'compare' ? (
          <>
            <button className="btn sm" onClick={() => d.choose(0)}>
              {tx('A[j] < pivot: A[i] ile takas, i++', 'A[j] < pivot: swap with A[i], i++')}
            </button>
            <button className="btn sm" onClick={() => d.choose(1)}>
              {tx('A[j] ≥ pivot: yerinde kalır', 'A[j] ≥ pivot: stays')}
            </button>
          </>
        ) : (
          Array.from({ length: hi + 1 }, (_, k) => (
            <button key={k} className="btn sm mono" onClick={() => d.choose(k)} aria-label={tx(`İndeks ${k}`, `Index ${k}`)}>
              {k}
            </button>
          ))
        ))
      }
    />
  )
}

function MomDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { steps, pivot } = useMemo(() => momDrill(drillInput('select-mom', seed)), [seed])
  const d = useDrill(steps, 'select-mom')
  const s = d.step
  const groups = steps[0].groups
  const medians = s ? s.medians : steps[steps.length - 1].options
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <div className="drill-groups">
            {groups.map((g, gi) => (
              <div key={gi} className={'drill-group' + (s?.group === gi ? ' active' : '')}>
                <span className="small muted">
                  {tx('Grup', 'Group')} {gi + 1}
                </span>
                {g.map((v) => (
                  <span key={v} className={'drill-chip mono' + (medians[gi] === v ? ' median' : '') + (!s && v === pivot ? ' pivot' : '')}>
                    {v}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="small" style={{ margin: 0 }}>
            {tx('Medyanlar', 'Medians')}: <span className="mono">{medians.length ? medians.join(', ') : '—'}</span>
            {!s && (
              <>
                {' '}
                · {tx('Pivot', 'Pivot')}: <strong className="mono">{pivot}</strong>
              </>
            )}
          </p>
        </div>
      }
      prompt={s && (s.group !== null ? tx(`Grup ${s.group + 1}’in medyanı hangisi?`, `Which is the median of group ${s.group + 1}?`) : tx('Medyanların medyanı (pivot) hangisi?', 'Which is the median of the medians (the pivot)?'))}
      controls={
        s &&
        s.options.map((v, k) => (
          <button key={v} className="btn sm mono" onClick={() => d.choose(k)}>
            {v}
          </button>
        ))
      }
    />
  )
}

function RadixDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { steps, final } = useMemo(() => radixDrill(drillInput('radix', seed), 10), [seed])
  const d = useDrill(steps, 'radix')
  const s = d.step
  const order = s ? s.order : final
  const cells: CellSpec[] = order.map((v, k) => ({ value: v, state: !s ? 'sorted' : k < s.pos ? 'elim' : k === s.pos ? 'active' : 'none' }))
  const digitName = (t: number) => [tx('birler', 'ones'), tx('onlar', 'tens')][t] ?? String(t)
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <p className="small" style={{ margin: 0 }}>
            {s ? tx(`Geçiş ${s.pass + 1} / ${s.passes}: ${digitName(s.pass)} basamağı`, `Pass ${s.pass + 1} / ${s.passes}: ${digitName(s.pass)} digit`) : tx('Bütün geçişler bitti: dizi sıralı.', 'All passes done: the array is sorted.')}
          </p>
          <ArrayView cells={cells} bars={false} label={tx('Geçişin girdisi', 'Input of the pass')} />
          {s && (
            <div className="drill-buckets" role="group" aria-label={tx('Kovalar', 'Buckets')}>
              {s.buckets.map((b, k) => (
                <button key={k} className="bucket" onClick={() => d.choose(k)} aria-label={tx(`Kova ${k}: ${b.join(', ') || 'boş'}`, `Bucket ${k}: ${b.join(', ') || 'empty'}`)}>
                  <span className="bucket-items mono">
                    {b.map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </span>
                  <span className="bucket-label mono">{k}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      }
      prompt={s && tx(`${s.order[s.pos]} hangi kovaya gider? Kovaya tıkla.`, `Which bucket does ${s.order[s.pos]} go to? Click the bucket.`)}
      controls={null}
    />
  )
}

function BstDrillView({ seed, onNew, onRestart }: DrillProps) {
  const keys = useMemo(() => drillInput('bst', seed), [seed])
  const { steps, final } = useMemo(() => bstDrill(keys), [keys])
  const d = useDrill(steps, 'bst')
  const s = d.step
  const roles: Record<number, NodeRole> = {}
  if (s) {
    s.path.forEach((k) => (roles[k] = 'path'))
    roles[s.at] = 'current'
  }
  const pending = s ? keys.slice(keys.indexOf(s.key) + 1) : []
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <p className="small" style={{ margin: 0 }}>
            {tx('Ekleme sırası', 'Insertion order')}: <span className="mono">{keys.join(', ')}</span>
            {s && pending.length > 0 && (
              <span className="muted">
                {' '}
                · {tx('sırada', 'still to come')}: {pending.join(', ')}
              </span>
            )}
          </p>
          <TreeView root={s ? s.tree : final} roles={roles} probe={s ? { key: s.key, at: s.at } : null} label={tx('İkili arama ağacı', 'Binary search tree')} />
        </div>
      }
      prompt={s && tx(`${s.key} ekleniyor; şu an ${s.at} düğümündesin. Hangi yöne?`, `Inserting ${s.key}; you are at node ${s.at}. Which way?`)}
      controls={
        s && (
          <>
            <button className="btn sm" onClick={() => d.choose(0)}>
              ← {tx('Sola', 'Left')}
            </button>
            <button className="btn sm" onClick={() => d.choose(1)}>
              {tx('Sağa', 'Right')} →
            </button>
          </>
        )
      }
    />
  )
}

const VIEWS: Record<DrillId, (p: DrillProps) => ReactNode> = {
  insertion: InsertionDrillView,
  merge: MergeDrillView,
  partition: PartitionDrillView,
  'select-mom': MomDrillView,
  radix: RadixDrillView,
  bst: BstDrillView,
  hash: HashDrillView,
  bfs: BfsDrillView,
  dfs: DfsDrillView,
  dijkstra: DijkstraDrillView,
  lcs: LcsDrillView,
  huffman: HuffmanDrillView,
  kruskal: KruskalDrillView,
  'gale-shapley': GsDrillView,
}

export function DrillRunner({ id }: { id: DrillId }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 1e6))
  const View = VIEWS[id]
  return (
    <Restartable
      key={id + ':' + seed}
      render={(restart) => <View seed={seed} onNew={() => setSeed((x) => (x * 7919 + 13) % 1000003)} onRestart={restart} />}
    />
  )
}

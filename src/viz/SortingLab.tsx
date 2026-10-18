import { useMemo, useState, type ReactNode } from 'react'
import { ArrayInput } from '../components/ArrayInput'
import { ArrayView, Legend, type CellSpec } from '../components/ArrayView'
import { TraceViewer } from '../components/TraceViewer'
import { INSERTION_SORT_CODE, insertionSortComparisons, insertionSortTrace, type InsertionState } from '../engines/insertionSort'
import { MERGE_SORT_CODE, mergeSortComparisons, mergeSortTrace, type MergeSortState, type MSNode } from '../engines/mergeSort'
import { makeRng, randomArray } from '../engines/random'
import { tx } from '../i18n/lang'

type Algo = 'insertion' | 'merge'

const presets = () => [
  { label: tx('Ders örneği', 'Lecture example'), values: [6, 4, 3, 8, 1, 5, 2, 7] },
  { label: tx('Ters sıralı (en kötü)', 'Reverse sorted (worst)'), values: [8, 7, 6, 5, 4, 3, 2, 1] },
  { label: tx('Neredeyse sıralı', 'Nearly sorted'), values: [1, 2, 3, 5, 4, 6, 7, 8] },
  { label: tx('Tekrarlı', 'Duplicates'), values: [3, 1, 3, 2, 1, 3] },
  { label: tx('Negatifler', 'Negatives'), values: [0, -4, 7, -1, 3, -4] },
]

export function SortingLab({ initial = 'insertion', lock = false }: { initial?: Algo; lock?: boolean }) {
  const [algo, setAlgo] = useState<Algo>(initial)
  const [arr, setArr] = useState<number[]>(presets()[0].values)
  const [seed, setSeed] = useState(1)
  const comps = useMemo(() => ({ insertion: insertionSortComparisons(arr), merge: mergeSortComparisons(arr) }), [arr])

  const toolbar = (
    <>
      {!lock && (
        <div className="field">
          {tx('Algoritma', 'Algorithm')}
          <div className="seg" role="group" aria-label={tx('Algoritma seçimi', 'Algorithm choice')}>
            <button aria-pressed={algo === 'insertion'} onClick={() => setAlgo('insertion')}>
              InsertionSort
            </button>
            <button aria-pressed={algo === 'merge'} onClick={() => setAlgo('merge')}>
              MergeSort
            </button>
          </div>
        </div>
      )}
      <ArrayInput
        value={arr}
        onChange={setArr}
        presets={presets()}
        options={{ maxLength: 16, min: -99, max: 99 }}
        random={() => {
          setSeed((s) => s + 1)
          return randomArray(makeRng(seed * 7919), 8 + (seed % 5), -9, 30)
        }}
        hint={tx('En fazla 16 tam sayı (−99…99). Aynı girdi her zaman aynı adımları üretir.', 'Up to 16 integers (−99…99). The same input always produces the same steps.')}
      />
    </>
  )
  const side = () => (
    <div>
      <span className="label-tag">{tx('Bu girdide karşılaştırma sayısı', 'Comparisons on this input')}</span>
      <table className="data">
        <tbody>
          <tr className={algo === 'insertion' ? 'hl' : ''}>
            <td>InsertionSort</td>
            <td className="num">{comps.insertion}</td>
          </tr>
          <tr className={algo === 'merge' ? 'hl' : ''}>
            <td>MergeSort</td>
            <td className="num">{comps.merge}</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted" style={{ marginTop: 4 }}>
        {tx('Ölçülen sayılardır (ampirik), tek bir girdi içindir; asimptotik bir kanıt değildir.', 'These are measured counts (empirical) for a single input; not an asymptotic proof.')}
      </p>
    </div>
  )
  return algo === 'insertion' ? (
    <InsertionView key={'i' + arr.join(',')} arr={arr} toolbar={toolbar} side={side} />
  ) : (
    <MergeView key={'m' + arr.join(',')} arr={arr} toolbar={toolbar} side={side} />
  )
}

function InsertionView({ arr, toolbar, side }: { arr: number[]; toolbar: ReactNode; side: () => ReactNode }) {
  const trace = useMemo(() => insertionSortTrace(arr), [arr])
  const min = Math.min(0, ...arr)
  const max = Math.max(1, ...arr)
  const render = (step: { state: InsertionState }) => {
    const s = step.state
    const cells: CellSpec[] = s.a.map((v, i) => {
      let state: CellSpec['state'] = 'none'
      if (s.done || i <= s.sortedEnd) state = 'sorted'
      if (s.hole === i) state = 'hole'
      if (s.compare === i) state = 'compare'
      const marks: string[] = []
      if (s.i === i) marks.push('i')
      if (s.j === i) marks.push('j')
      return { value: s.hole === i ? null : v, state, mark: marks.join(',') || undefined }
    })
    return (
      <div>
        <div className="row small" style={{ minHeight: 28 }}>
          {s.current !== null && (
            <span className="badge accent" aria-live="polite">
              current = <strong className="mono">{s.current}</strong>
            </span>
          )}
          {!s.done && s.sortedEnd >= 0 && <span className="muted">{tx('Sıralı önek', 'Sorted prefix')}: A[:{s.sortedEnd + 1}]</span>}
        </div>
        <ArrayView cells={cells} label={tx('InsertionSort dizi durumu', 'InsertionSort array state')} minValue={min} maxValue={max} />
      </div>
    )
  }
  return (
    <TraceViewer
      trace={trace}
      label={tx('InsertionSort görselleştirmesi', 'InsertionSort visualization')}
      render={render}
      code={INSERTION_SORT_CODE}
      toolbar={toolbar}
      side={side}
      legend={<Legend states={['sorted', 'compare', 'hole']} />}
    />
  )
}

function MergeView({ arr, toolbar, side }: { arr: number[]; toolbar: ReactNode; side: () => ReactNode }) {
  const trace = useMemo(() => mergeSortTrace(arr), [arr])
  const render = (step: { state: MergeSortState }) => <MergeTree s={step.state} n={arr.length} />
  return (
    <TraceViewer
      trace={trace}
      label={tx('MergeSort görselleştirmesi', 'MergeSort visualization')}
      render={render}
      code={MERGE_SORT_CODE}
      toolbar={toolbar}
      side={side}
      legend={
        <>
          <Legend states={['active', 'compare', 'sorted']} />
          <span className="muted">{tx('Satırlar özyineleme seviyeleridir (seviye 0 = tüm dizi).', 'Rows are recursion levels (level 0 = the whole array).')}</span>
        </>
      }
    />
  )
}

function MergeTree({ s, n }: { s: MergeSortState; n: number }) {
  if (n === 0) return <p className="muted">{tx('Boş dizi.', 'Empty array.')}</p>
  const rows: MSNode[][] = Array.from({ length: s.maxDepth + 1 }, () => [])
  for (const node of s.nodes) rows[node.depth].push(node)
  const cell = 34
  const statusState = (st: MSNode['status'], id: string): CellSpec['state'] => {
    if (id === s.activeId && st !== 'done') return 'active'
    if (st === 'merging') return 'compare'
    if (st === 'done' || st === 'base') return 'sorted'
    return 'none'
  }
  return (
    <div>
      <div style={{ display: 'grid', gap: 10, minWidth: n * (cell + 6) + 60 }}>
        {rows.map((row, depth) => (
          <div key={depth} style={{ display: 'grid', gridTemplateColumns: `52px repeat(${n}, ${cell}px)`, columnGap: 6, alignItems: 'center' }}>
            <span className="small muted mono">{tx('sv', 'lv')} {depth}</span>
            {row.map((node) => {
              const st = statusState(node.status, node.id)
              const waiting = node.status === 'waiting'
              return (
                <div
                  key={node.id}
                  className={`cell box st-${st}`}
                  style={{ gridColumn: `${node.lo + 2} / ${node.hi + 2}`, opacity: waiting ? 0.45 : 1, minWidth: 0 }}
                  aria-label={`${tx('Seviye', 'Level')} ${depth}, A[${node.lo}:${node.hi}] = [${node.values.join(', ')}], ${node.status}`}
                >
                  <div className="bar" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 34 }}>
                    {node.values.map((v, i) => (
                      <span key={i} className="val">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {s.merge && (
        <div className="card card-pad" style={{ marginTop: 16, boxShadow: 'none' }}>
          <span className="label-tag">Merge(L, R)</span>
          <MergeRow name="L" values={s.merge.L} ptr={s.merge.i} took={s.merge.took === 'L'} />
          <MergeRow name="R" values={s.merge.R} ptr={s.merge.j} took={s.merge.took === 'R'} />
          <div className="row" style={{ marginTop: 6 }}>
            <span className="mono small" style={{ width: 22 }}>
              S
            </span>
            <ArrayView bars={false} label={tx('Birleştirilmiş çıktı S', 'Merged output S')} cells={s.merge.S.map((v, i) => ({ value: v, state: i === s.merge!.S.length - 1 && s.merge!.took ? 'active' : 'sorted' }))} />
          </div>
        </div>
      )}
    </div>
  )
}

function MergeRow({ name, values, ptr, took }: { name: string; values: number[]; ptr: number; took: boolean }) {
  return (
    <div className="row" style={{ marginTop: 4 }}>
      <span className="mono small" style={{ width: 22 }}>
        {name}
      </span>
      <ArrayView
        bars={false}
        label={tx(`${name} listesi`, `list ${name}`)}
        cells={values.map((v, i) => ({
          value: v,
          state: i < ptr ? (i === ptr - 1 && took ? 'active' : 'elim') : i === ptr ? 'compare' : 'none',
          mark: i === ptr ? (name === 'L' ? 'i' : 'j') : undefined,
        }))}
      />
    </div>
  )
}

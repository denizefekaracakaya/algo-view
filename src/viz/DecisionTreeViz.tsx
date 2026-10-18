import { useMemo, useState } from 'react'
import { Tex } from '../components/Tex'
import { LABELS, buildDecisionTree, factorial, log2Factorial, permutations, runWithOracle, type DTAlgo, type DTNode } from '../engines/decisionTree'
import { tx } from '../i18n/lang'

const algoLabel = (): Record<DTAlgo, string> => ({ insertion: 'InsertionSort', merge: 'MergeSort', quick: tx('QuickSort (ilk eleman pivot)', 'QuickSort (first-element pivot)') })

/** Decision tree of a comparison sort on n = 3 or 4 items, with the path of a chosen input highlighted. */
export function DecisionTreeViz() {
  const [algo, setAlgo] = useState<DTAlgo>('insertion')
  const [n, setN] = useState(3)
  const perms = useMemo(() => permutations(n), [n])
  const [permIdx, setPermIdx] = useState(0)
  const ranks = perms[Math.min(permIdx, perms.length - 1)]
  const tree = useMemo(() => buildDecisionTree(algo, n), [algo, n])
  const run = useMemo(() => runWithOracle(algo, ranks), [algo, ranks])
  const pathIds = useMemo(() => {
    const ids = [0]
    let cur = 0
    for (const step of run.path) {
      const nd = tree.nodes[cur]
      cur = (step.yes ? nd.yes : nd.no)!
      ids.push(cur)
    }
    return new Set(ids)
  }, [run, tree])
  const ALGO_LABEL = algoLabel()
  const inputText = (r: number[]) => r.map((rank, x) => `${LABELS[x]}=${rank + 1}`).join(', ')

  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <div className="field">
          {tx('Algoritma', 'Algorithm')}
          <div className="seg" role="group" aria-label={tx('Algoritma', 'Algorithm')}>
            {(Object.keys(ALGO_LABEL) as DTAlgo[]).map((a) => (
              <button key={a} aria-pressed={algo === a} onClick={() => setAlgo(a)}>
                {ALGO_LABEL[a]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          {tx('Eleman sayısı', 'Number of items')}
          <div className="seg" role="group" aria-label="n">
            {[3, 4].map((k) => (
              <button
                key={k}
                aria-pressed={n === k}
                onClick={() => {
                  setN(k)
                  setPermIdx(0)
                }}
              >
                n = {k}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          {tx('Gizli girdi sırası (genie’nin bildiği)', 'Hidden input order (known to the genie)')}
          <select className="input mono" value={permIdx} onChange={(e) => setPermIdx(Number(e.target.value))}>
            {perms.map((p, i) => (
              <option key={i} value={i}>
                {inputText(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <DTSvg tree={tree} path={pathIds} />
          <p className="small muted">
            {tx(
              'İç düğümler “x < y ?” sorularıdır (sol dal EVET, sağ dal HAYIR). Yapraklar çıktı sıralamasıdır. Vurgulanan yol seçilen girdinin çalışmasıdır.',
              'Internal nodes are “x < y ?” questions (left branch YES, right branch NO). Leaves are output orderings. The highlighted path is the run on the selected input.',
            )}
          </p>
        </div>
        <aside className="viz-side">
          <div>
            <span className="label-tag">{tx('Bu girdi için sorulan sorular', 'Questions asked for this input')}</span>
            <ol className="small" style={{ margin: 0, paddingLeft: '1.3em' }} aria-live="polite">
              {run.path.map((p, i) => (
                <li key={i} className="mono">
                  {LABELS[p.q[0]]} &lt; {LABELS[p.q[1]]} ? → {p.yes ? tx('EVET', 'YES') : tx('HAYIR', 'NO')}
                </li>
              ))}
            </ol>
            <p className="small" style={{ marginTop: 6 }}>
              {tx('Çıktı:', 'Output:')} <span className="mono">{run.output.map((x) => LABELS[x]).join(' < ')}</span> ({run.path.length} {tx('karşılaştırma', 'comparisons')})
            </p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <tbody>
                <tr>
                  <td>{tx('Yaprak sayısı (farklı çıktı)', 'Number of leaves (distinct outputs)')}</td>
                  <td className="num">{tree.leaves}</td>
                </tr>
                <tr>
                  <td>
                    <Tex>{`n! = ${n}!`}</Tex>
                  </td>
                  <td className="num">{factorial(n)}</td>
                </tr>
                <tr>
                  <td>{tx('Ağaç yüksekliği (en kötü durum karşılaştırma)', 'Tree height (worst-case comparisons)')}</td>
                  <td className="num">{tree.height}</td>
                </tr>
                <tr className="hl">
                  <td>
                    {tx('Alt sınır', 'Lower bound')} <Tex>{'\\lceil \\log_2 n! \\rceil'}</Tex>
                  </td>
                  <td className="num">{Math.ceil(log2Factorial(n) - 1e-9)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small">
            {tx('Yüksekliği h olan bir ikili ağacın en fazla', 'A binary tree of height h has at most')} <Tex>{'2^h'}</Tex> {tx('yaprağı vardır. Doğru bir algoritma her', 'leaves. A correct algorithm must distinguish all')} <Tex>{'n!'}</Tex>{' '}
            {tx('sıralamayı ayırt etmek zorunda olduğundan', 'orderings, so')} <Tex>{'2^h \\ge n!'}</Tex>, {tx('yani', 'i.e.')} <Tex>{'h \\ge \\log_2 n!'}</Tex>.
          </p>
        </aside>
      </div>
    </div>
  )
}

function DTSvg({ tree, path }: { tree: ReturnType<typeof buildDecisionTree>; path: Set<number> }) {
  const { nodes } = tree
  const pos = new Map<number, { x: number; y: number }>()
  let leaf = 0
  const place = (id: number): number => {
    const nd = nodes[id]
    const kids = [nd.yes, nd.no].filter((k): k is number => k !== null)
    const x = kids.length ? kids.map(place).reduce((a, b) => a + b, 0) / kids.length : leaf++
    pos.set(id, { x, y: nd.depth })
    return x
  }
  place(0)
  const gx = tree.n === 3 ? 76 : 50
  const gy = 70
  const W = leaf * gx + 20
  const H = (tree.height + 1) * gy + 10
  const P = (id: number) => ({ x: 10 + gx / 2 + pos.get(id)!.x * gx, y: 24 + pos.get(id)!.y * gy })
  const label = (nd: DTNode) => (nd.q ? `${LABELS[nd.q[0]]}<${LABELS[nd.q[1]]}?` : nd.output!.map((x) => LABELS[x]).join(''))
  return (
    <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={tx(`Karar ağacı: ${tree.leaves} yaprak, yükseklik ${tree.height}`, `Decision tree: ${tree.leaves} leaves, height ${tree.height}`)}>
      {nodes.map((nd) =>
        (['yes', 'no'] as const).map((br) => {
          const c = nd[br]
          if (c === null) return null
          const a = P(nd.id)
          const b = P(c)
          const on = path.has(nd.id) && path.has(c)
          return (
            <g key={nd.id + br}>
              <line className={'edge' + (on ? ' path' : '')} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              <text x={(a.x + b.x) / 2 + (br === 'yes' ? -8 : 8)} y={(a.y + b.y) / 2} fontSize={10} fill="var(--muted)" textAnchor="middle">
                {br === 'yes' ? tx('E', 'Y') : tx('H', 'N')}
              </text>
            </g>
          )
        }),
      )}
      {nodes.map((nd) => {
        const p = P(nd.id)
        const on = path.has(nd.id)
        const isLeaf = !nd.q
        const w = isLeaf ? 8 * tree.n + 14 : 52
        return (
          <g key={nd.id} transform={`translate(${p.x} ${p.y})`}>
            <rect
              x={-w / 2}
              y={-12}
              width={w}
              height={24}
              rx={isLeaf ? 12 : 6}
              fill={on ? (isLeaf ? 'var(--st-sorted-bg)' : 'var(--accent-soft)') : 'var(--surface)'}
              stroke={on ? (isLeaf ? 'var(--st-sorted)' : 'var(--accent)') : 'var(--border-strong)'}
              strokeWidth={on ? 2 : 1.2}
            />
            <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={11} fontWeight={on ? 700 : 500} fill="var(--text)">
              {label(nd)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

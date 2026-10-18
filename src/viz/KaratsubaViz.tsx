import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { LineChart } from '../components/LineChart'
import { KARATSUBA_CODE, MULT1_CODE, gradeSchoolOps, multiply, multiplyTrace, type MultAlgo, type MultNode, type MultState } from '../engines/karatsuba'
import { makeRng } from '../engines/random'
import { tx } from '../i18n/lang'

const PRESETS: [string, string][] = [
  ['1234', '5678'],
  ['12', '34'],
  ['99', '99'],
  ['31415926', '27182818'],
]

export function KaratsubaViz() {
  const [algo, setAlgo] = useState<MultAlgo>('karatsuba')
  const [x, setX] = useState('1234')
  const [y, setY] = useState('5678')
  const [input, setInput] = useState<[string, string]>(['1234', '5678'])
  const [error, setError] = useState<string | null>(null)
  const trace = useMemo(() => multiplyTrace(BigInt(input[0]), BigInt(input[1]), algo), [input, algo])

  const apply = (a: string, b: string) => {
    const ok = (s: string) => /^\d{1,8}$/.test(s.trim())
    if (!ok(a) || !ok(b)) {
      setError(tx('Her sayı 1–8 basamaklı, negatif olmayan bir tam sayı olmalı (ağacın okunabilir kalması için).', 'Each number must be a non-negative integer with 1–8 digits (to keep the tree readable).'))
      return
    }
    setError(null)
    setX(a.trim())
    setY(b.trim())
    setInput([a.trim(), b.trim()])
  }

  const toolbar = (
    <>
      <div className="field">
        {tx('Algoritma', 'Algorithm')}
        <div className="seg" role="group" aria-label={tx('Çarpma algoritması', 'Multiplication algorithm')}>
          <button aria-pressed={algo === 'mult1'} onClick={() => setAlgo('mult1')}>
            {tx('Mult1 (4 alt problem)', 'Mult1 (4 subproblems)')}
          </button>
          <button aria-pressed={algo === 'karatsuba'} onClick={() => setAlgo('karatsuba')}>
            {tx('Karatsuba (3 alt problem)', 'Karatsuba (3 subproblems)')}
          </button>
        </div>
      </div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          apply(x, y)
        }}
      >
        <label className="field">
          x
          <input className="input mono" style={{ width: 120 }} value={x} onChange={(e) => setX(e.target.value)} inputMode="numeric" aria-invalid={!!error} />
        </label>
        <span style={{ alignSelf: 'flex-end', paddingBottom: 6 }}>×</span>
        <label className="field">
          y
          <input className="input mono" style={{ width: 120 }} value={y} onChange={(e) => setY(e.target.value)} inputMode="numeric" aria-invalid={!!error} />
        </label>
        <button className="btn primary" style={{ alignSelf: 'flex-end' }} type="submit">
          {tx('Uygula', 'Apply')}
        </button>
      </form>
      <div className="row" role="group" aria-label={tx('Hazır örnekler', 'Preset examples')}>
        {PRESETS.map(([a, b]) => (
          <button key={a + b} className="btn sm" onClick={() => apply(a, b)}>
            {a}×{b}
          </button>
        ))}
      </div>
      {error && (
        <div className="error-msg" role="alert" style={{ flexBasis: '100%' }}>
          {error}
        </div>
      )}
    </>
  )

  return (
    <div className="stack">
      <TraceViewer
        key={algo + input.join('x')}
        trace={trace}
        label={tx('Böl ve fethet çarpma görselleştirmesi', 'Divide-and-conquer multiplication visualization')}
        toolbar={toolbar}
        code={algo === 'karatsuba' ? KARATSUBA_CODE : MULT1_CODE}
        render={(step) => <CallTree s={step.state} />}
        legend={
          <>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--st-active)', background: 'var(--st-active-bg)' }} aria-hidden>
                •
              </span>
              {tx('etkin çağrı', 'active call')}
            </span>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--st-sorted)', background: 'var(--st-sorted-bg)' }} aria-hidden>
                ✓
              </span>
              {tx('tamamlandı (sonuç altta)', 'done (result below)')}
            </span>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface)' }} aria-hidden />
              {tx('taban durumu: 1 tek basamaklı çarpma', 'base case: 1 one-digit multiplication')}
            </span>
          </>
        }
        side={() => (
          <p className="small muted">
            {tx(
              `Okul yöntemi bu girdide ${gradeSchoolOps(BigInt(input[0]), BigInt(input[1]))} tek basamaklı çarpma yapar.`,
              `The grade-school method makes ${gradeSchoolOps(BigInt(input[0]), BigInt(input[1]))} one-digit multiplications on this input.`,
            )}
          </p>
        )}
      />
      <OpsChart />
    </div>
  )
}

function CallTree({ s }: { s: MultState }) {
  const nodes = s.nodes
  if (!nodes.length) return null
  const children = new Map<string, MultNode[]>()
  for (const n of nodes) if (n.parent) children.set(n.parent, [...(children.get(n.parent) ?? []), n])
  // leaf-order layout
  const pos = new Map<string, { x: number; y: number }>()
  let leaf = 0
  const place = (n: MultNode): number => {
    const ch = children.get(n.id) ?? []
    const x = ch.length ? ch.map(place).reduce((a, b) => a + b, 0) / ch.length : leaf++
    pos.set(n.id, { x, y: n.depth })
    return x
  }
  place(nodes[0])
  const W = 92
  const H = 74
  const maxD = Math.max(...nodes.map((n) => n.depth))
  const width = Math.max(leaf, 1) * W + 20
  const height = (maxD + 1) * H + 10
  return (
    <svg className="tree-svg" viewBox={`0 0 ${width} ${height}`} width={width} role="img" aria-label={tx(`Özyineleme ağacı, ${nodes.length} çağrı`, `Recursion tree, ${nodes.length} calls`)}>
      {nodes.map((n) => {
        if (!n.parent) return null
        const a = pos.get(n.parent)!
        const b = pos.get(n.id)!
        return <line key={'e' + n.id} className="edge" x1={a.x * W + W / 2 + 10} y1={a.y * H + 40} x2={b.x * W + W / 2 + 10} y2={b.y * H + 8} />
      })}
      {nodes.map((n) => {
        const p = pos.get(n.id)!
        const active = n.id === s.activeId
        const done = n.status === 'done' || n.status === 'base'
        const cx = p.x * W + W / 2 + 10
        return (
          <g key={n.id} transform={`translate(${cx} ${p.y * H + 8})`}>
            <rect
              x={-42}
              y={0}
              width={84}
              height={34}
              rx={7}
              fill={active ? 'var(--st-active-bg)' : done ? 'var(--st-sorted-bg)' : 'var(--surface)'}
              stroke={active ? 'var(--st-active)' : done ? 'var(--st-sorted)' : 'var(--border-strong)'}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <text x={0} y={13} textAnchor="middle" fontSize={11} fontFamily="var(--mono)" fill="var(--text)" fontWeight={700}>
              {n.x}×{n.y}
            </text>
            <text x={0} y={27} textAnchor="middle" fontSize={10} fontFamily="var(--mono)" fill="var(--text-2)">
              {n.result !== undefined ? '= ' + n.result : n.role}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function OpsChart() {
  const data = useMemo(() => {
    const rng = makeRng(2024)
    const ns = [1, 2, 4, 8, 16, 32, 64]
    const rand = (n: number) => BigInt('1' + Array.from({ length: n - 1 }, () => Math.floor(rng() * 10)).join(''))
    return ns.map((n) => {
      const x = n === 1 ? 7n : rand(n)
      const y = n === 1 ? 8n : rand(n)
      return { n, school: gradeSchoolOps(x, y), mult1: multiply(x, y, 'mult1').ops, kara: multiply(x, y, 'karatsuba').ops }
    })
  }, [])
  return (
    <div className="card card-pad">
      <h3>{tx('Tek basamaklı çarpma sayısı: ölçüm ve kuram', 'Number of one-digit multiplications: measurement and theory')}</h3>
      <p className="small muted">
        {tx(
          'Noktalar, sabit tohumla üretilmiş rastgele n basamaklı sayılar üzerinde gerçekten sayılan işlemlerdir (ampirik). Çizgiler kuramsal büyüme fonksiyonlarıdır. Logaritmik dikey eksen.',
          'Dots are operations actually counted on random n-digit numbers generated with a fixed seed (empirical). Lines are theoretical growth functions. Logarithmic vertical axis.',
        )}
      </p>
      <LineChart
        title={tx('Basamak sayısına göre tek basamaklı çarpma sayısı', 'One-digit multiplications by number of digits')}
        xLabel={tx('n (basamak)', 'n (digits)')}
        yLabel={tx('işlem (log)', 'operations (log)')}
        logY
        series={[
          { name: tx('n² (kuram)', 'n² (theory)'), color: 'var(--series-2)', dashed: true, points: data.map((d) => ({ x: d.n, y: d.n ** 2 })) },
          { name: tx('n^log₂3 ≈ n^1.585 (kuram)', 'n^log₂3 ≈ n^1.585 (theory)'), color: 'var(--series-1)', dashed: true, points: data.map((d) => ({ x: d.n, y: d.n ** Math.log2(3) })) },
          { name: tx('Mult1 (ölçüm)', 'Mult1 (measured)'), color: 'var(--series-2)', dots: true, points: data.map((d) => ({ x: d.n, y: d.mult1 })) },
          { name: tx('Karatsuba (ölçüm)', 'Karatsuba (measured)'), color: 'var(--series-1)', dots: true, points: data.map((d) => ({ x: d.n, y: d.kara })) },
        ]}
      />
      <div className="table-wrap">
        <table className="data" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>n</th>
              <th>{tx('Okul yöntemi', 'Grade school')}</th>
              <th>Mult1</th>
              <th>Karatsuba</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.n}>
                <td className="num">{d.n}</td>
                <td className="num">{d.school}</td>
                <td className="num">{d.mult1}</td>
                <td className="num">{d.kara}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        {tx(
          'Karatsuba sayıları tam olarak 3^log₂n olmayabilir: (a+b) ve (c+d) bir basamak daha uzun olabilir (notlarda da belirtilen “hile”). Asimptotik davranış değişmez.',
          'The Karatsuba counts may not be exactly 3^log₂n: (a+b) and (c+d) can be one digit longer (the “cheat” the notes mention too). The asymptotic behavior is unchanged.',
        )}
      </p>
    </div>
  )
}

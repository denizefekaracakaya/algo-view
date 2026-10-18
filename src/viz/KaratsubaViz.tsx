import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { LineChart } from '../components/LineChart'
import { KARATSUBA_CODE, MULT1_CODE, gradeSchoolOps, multiply, multiplyTrace, type MultAlgo, type MultNode, type MultState } from '../engines/karatsuba'
import { makeRng } from '../engines/random'

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
      setError('Her sayı 1–8 basamaklı, negatif olmayan bir tam sayı olmalı (ağacın okunabilir kalması için).')
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
        Algoritma
        <div className="seg" role="group" aria-label="Çarpma algoritması">
          <button aria-pressed={algo === 'mult1'} onClick={() => setAlgo('mult1')}>
            Mult1 (4 alt problem)
          </button>
          <button aria-pressed={algo === 'karatsuba'} onClick={() => setAlgo('karatsuba')}>
            Karatsuba (3 alt problem)
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
          Uygula
        </button>
      </form>
      <div className="row" role="group" aria-label="Hazır örnekler">
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
        label="Böl ve fethet çarpma görselleştirmesi"
        toolbar={toolbar}
        code={algo === 'karatsuba' ? KARATSUBA_CODE : MULT1_CODE}
        render={(step) => <CallTree s={step.state} />}
        legend={
          <>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--st-active)', background: 'var(--st-active-bg)' }} aria-hidden>
                •
              </span>
              etkin çağrı
            </span>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--st-sorted)', background: 'var(--st-sorted-bg)' }} aria-hidden>
                ✓
              </span>
              tamamlandı (sonuç altta)
            </span>
            <span>
              <span className="swatch" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface)' }} aria-hidden />
              taban durumu: 1 tek basamaklı çarpma
            </span>
          </>
        }
        side={() => (
          <p className="small muted">
            Okul yöntemi bu girdide {gradeSchoolOps(BigInt(input[0]), BigInt(input[1]))} tek basamaklı çarpma yapar.
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
    <svg className="tree-svg" viewBox={`0 0 ${width} ${height}`} width={width} role="img" aria-label={`Özyineleme ağacı, ${nodes.length} çağrı`}>
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
      <h3>Tek basamaklı çarpma sayısı: ölçüm ve kuram</h3>
      <p className="small muted">
        Noktalar, sabit tohumla üretilmiş rastgele n basamaklı sayılar üzerinde gerçekten sayılan işlemlerdir (ampirik). Çizgiler kuramsal büyüme fonksiyonlarıdır. Logaritmik dikey eksen.
      </p>
      <LineChart
        title="Basamak sayısına göre tek basamaklı çarpma sayısı"
        xLabel="n (basamak)"
        yLabel="işlem (log)"
        logY
        series={[
          { name: 'n² (kuram)', color: 'var(--series-2)', dashed: true, points: data.map((d) => ({ x: d.n, y: d.n ** 2 })) },
          { name: 'n^log₂3 ≈ n^1.585 (kuram)', color: 'var(--series-1)', dashed: true, points: data.map((d) => ({ x: d.n, y: d.n ** Math.log2(3) })) },
          { name: 'Mult1 (ölçüm)', color: 'var(--series-2)', dots: true, points: data.map((d) => ({ x: d.n, y: d.mult1 })) },
          { name: 'Karatsuba (ölçüm)', color: 'var(--series-1)', dots: true, points: data.map((d) => ({ x: d.n, y: d.kara })) },
        ]}
      />
      <div className="table-wrap">
        <table className="data" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>n</th>
              <th>Okul yöntemi</th>
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
        Karatsuba sayıları tam olarak 3^log₂n olmayabilir: (a+b) ve (c+d) bir basamak daha uzun olabilir (notlarda da belirtilen “hile”). Asimptotik davranış değişmez.
      </p>
    </div>
  )
}

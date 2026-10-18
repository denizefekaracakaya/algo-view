import { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Tex } from '../components/Tex'
import { analyzeRecurrence, fmt, masterTheorem, recursionLevels, texPower, validateMaster, type MasterResult } from '../engines/recurrence'
import { tx } from '../i18n/lang'

const examples = () => [
  { label: 'MergeSort', text: 'T(n) = 2T(n/2) + O(n)' },
  { label: 'Mult1', text: 'T(n) = 4T(n/2) + O(n)' },
  { label: 'Karatsuba', text: 'T(n) = 3T(n/2) + O(n)' },
  { label: tx('Tepe baskın', 'Root-heavy'), text: 'T(n) = 2T(n/2) + O(n^2)' },
  { label: tx('Kök n', 'Square root'), text: 'T(n) = 4T(n/16) + sqrt(n)' },
  { label: 'Select (MoM)', text: 'T(n) = T(n/5) + T(7n/10) + n' },
  { label: 'T(n−1)', text: 'T(n) = T(n-1) + n' },
  { label: tx('Boşluk durumu', 'Gap case'), text: 'T(n) = 2T(n/2) + n log n' },
]

const caseText = (c: MasterResult['case']): string =>
  ({
    equal: tx('a = b^d — her seviye eşit iş', 'a = b^d — equal work on every level'),
    top: tx('a < b^d — kök (en üst seviye) baskın', 'a < b^d — the root (top level) dominates'),
    leaves: tx('a > b^d — yapraklar baskın', 'a > b^d — the leaves dominate'),
  })[c]

/** Master Theorem explorer: separate parameter fields + free-form recurrence playground + recursion tree. */
export function MasterLab() {
  const [mode, setMode] = useState<'params' | 'text'>('params')
  const [a, setA] = useState('2')
  const [b, setB] = useState('2')
  const [d, setD] = useState('1')
  const EXAMPLES = examples()
  const [text, setText] = useState(EXAMPLES[0].text)
  const [submitted, setSubmitted] = useState(EXAMPLES[0].text)

  const params = useMemo(() => {
    const A = Number(a)
    const B = Number(b)
    const D = Number(d)
    if ([a, b, d].some((s) => s.trim() === '')) return { error: tx('Tüm alanları doldurun.', 'Fill in all fields.') as string }
    const err = validateMaster(A, B, D)
    if (err) return { error: err }
    return { result: masterTheorem(A, B, D) as MasterResult }
  }, [a, b, d])
  const analysis = useMemo(() => analyzeRecurrence(submitted), [submitted])

  let shown: MasterResult | null = null
  if (mode === 'params' && 'result' in params) shown = params.result!
  if (mode === 'text' && analysis.kind === 'master') shown = analysis.result

  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <div className="seg" role="tablist" aria-label={tx('Giriş biçimi', 'Input mode')}>
          <button role="tab" aria-selected={mode === 'params'} onClick={() => setMode('params')}>
            {tx('a, b, d parametreleri', 'Parameters a, b, d')}
          </button>
          <button role="tab" aria-selected={mode === 'text'} onClick={() => setMode('text')}>
            {tx('Bağıntı yaz (playground)', 'Write a recurrence (playground)')}
          </button>
        </div>
        {mode === 'params' ? (
          <div className="row" style={{ flexBasis: '100%' }}>
            <Tex>{'T(n) = a\\cdot T\\!\\left(\\tfrac{n}{b}\\right) + O(n^d)'}</Tex>
            <label className="field">
              {tx('a (alt problem sayısı)', 'a (number of subproblems)')}
              <input className="input mono" style={{ width: 110 }} value={a} onChange={(e) => setA(e.target.value)} inputMode="numeric" />
            </label>
            <label className="field">
              {tx('b (küçülme çarpanı)', 'b (shrink factor)')}
              <input className="input mono" style={{ width: 110 }} value={b} onChange={(e) => setB(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              {tx('d (iş üssü)', 'd (work exponent)')}
              <input className="input mono" style={{ width: 110 }} value={d} onChange={(e) => setD(e.target.value)} inputMode="decimal" />
            </label>
          </div>
        ) : (
          <div className="stack" style={{ flexBasis: '100%', gap: 6 }}>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(text)
              }}
            >
              <label className="field grow">
                {tx('Özyineleme bağıntısı', 'Recurrence')}
                <input className="input mono" value={text} onChange={(e) => setText(e.target.value)} aria-describedby="rec-help" />
              </label>
              <button className="btn primary" style={{ alignSelf: 'flex-end' }} type="submit">
                {tx('Analiz et', 'Analyze')}
              </button>
            </form>
            <div className="row">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  className="btn sm"
                  onClick={() => {
                    setText(ex.text)
                    setSubmitted(ex.text)
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <span id="rec-help" className="small muted">
              {tx('Desteklenen biçim:', 'Supported form:')} <code>T(n) = aT(n/b) + {tx('iş', 'work')}</code>; {tx('iş terimi', 'the work term can be')} <code>n^d</code>, <code>5n</code>, <code>sqrt(n)</code>, <code>1</code>, <code>n log n</code>, <code>O(…)</code>
              {tx(' olabilir. Farklı boyutlu terimler ve ', '. Terms of different sizes and ')}<code>T(n-1)</code>
              {tx(' tanınır ama Master Teoremi’nin dışında olduğu açıkça belirtilir.', ' are recognized, but flagged explicitly as outside the Master Theorem.')}
            </span>
          </div>
        )}
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          {mode === 'params' && 'error' in params && (
            <div className="error-msg" role="alert">
              {params.error}
            </div>
          )}
          {mode === 'text' && <TextAnalysis analysis={analysis} />}
          {shown && <CaseExplanation r={shown} />}
          {shown && <RecursionTreeLevels a={shown.a} b={shown.b} d={shown.d} />}
        </div>
        <aside className="viz-side">
          <span className="label-tag">{tx('Master Teoremi (Ders 3)', 'Master Theorem (Lecture 3)')}</span>
          <Tex display>{'T(n)=\\begin{cases} O(n^d\\log n) & a = b^d\\\\ O(n^d) & a < b^d \\\\ O(n^{\\log_b a}) & a > b^d\\end{cases}'}</Tex>
          <p className="small">
            {tx('Koşullar:', 'Conditions:')} <Tex>{'a \\ge 1'}</Tex> {tx('tam sayı', 'an integer')}, <Tex>{'b > 1'}</Tex>, <Tex>{'d \\ge 0'}</Tex>; {tx('tüm alt problemler aynı boyutta', 'all subproblems have the same size')} (<Tex>{'n/b'}</Tex>){' '}
            {tx('ve taban durumu', 'and the base case is')} <Tex>{'T(1)=O(1)'}</Tex>.
          </p>
          <p className="small muted">
            {tx(
              'İş terimi O(n^d) ile verildiğinde teorem bir üst sınır (O) verir. İş Θ(n^d) ise aynı ifadeler sıkı (Θ) sınırdır — notlardaki genel sürüm.',
              'When the work term is given as O(n^d), the theorem gives an upper bound (O). If the work is Θ(n^d), the same expressions are tight (Θ) bounds — the general version in the notes.',
            )}
          </p>
        </aside>
      </div>
    </div>
  )
}

function TextAnalysis({ analysis }: { analysis: ReturnType<typeof analyzeRecurrence> }) {
  if (analysis.kind === 'error')
    return (
      <div className="error-msg" role="alert">
        {analysis.error}
      </div>
    )
  if (analysis.kind === 'unsupported')
    return (
      <div className="callout warn" role="status">
        <strong>
          <AlertTriangle size={15} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Master Teoremi uygulanamaz.', 'The Master Theorem does not apply.')}
        </strong>{' '}
        {analysis.reason}
        <p className="small" style={{ margin: '6px 0 0' }}>
          <strong>{tx('Ne yapmalı?', 'What to do?')}</strong> {analysis.suggestion}
        </p>
      </div>
    )
  if (analysis.kind === 'general') {
    const g = analysis.general
    return (
      <div className={'callout ' + (g.applies ? 'formal' : 'warn')} role="status">
        <strong>{tx('İş terimi bir log çarpanı içeriyor', 'The work term contains a log factor')}</strong> (<Tex>{analysis.work.tex}</Tex>),{' '}
        {tx('bu yüzden O(n^d) biçimindeki temel sürüm doğrudan uygulanamaz. Genel sürüm (Teorem 3):', 'so the basic O(n^d) version does not apply directly. The general version (Theorem 3):')}
        <p style={{ margin: '6px 0 0' }}>
          {g.applies ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />} {g.reason}
          {g.applies && (
            <>
              {' '}
              {tx('Sonuç:', 'Result:')} <Tex>{`T(n) = \\Theta(${g.bound})`}</Tex>
            </>
          )}
        </p>
      </div>
    )
  }
  return (
    <p className="small">
      {tx('Tanınan biçim:', 'Recognized form:')} <Tex>{`a = ${fmt(analysis.a)},\\ b = ${fmt(analysis.b)},\\ f(n) = ${analysis.work.tex}`}</Tex> ⇒ <Tex>{`d = ${fmt(analysis.work.d)}`}</Tex>.
    </p>
  )
}

function CaseExplanation({ r }: { r: MasterResult }) {
  const tick = (on: boolean) => (on ? '✓' : '·')
  return (
    <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
      <div className="table-wrap">
        <table className="data" aria-label={tx('Durum karşılaştırması', 'Case comparison')}>
          <thead>
            <tr>
              <th>{tx('Durum', 'Case')}</th>
              <th>{tx('Koşul', 'Condition')}</th>
              <th>{tx('Sonuç', 'Result')}</th>
              <th>{tx('Bu bağıntı', 'This recurrence')}</th>
            </tr>
          </thead>
          <tbody>
            {(['equal', 'top', 'leaves'] as const).map((c) => (
              <tr key={c} className={r.case === c ? 'hl' : ''}>
                <td>{caseText(c)}</td>
                <td>
                  <Tex>{c === 'equal' ? 'a = b^d' : c === 'top' ? 'a < b^d' : 'a > b^d'}</Tex>
                </td>
                <td>
                  <Tex>{c === 'equal' ? 'O(n^d \\log n)' : c === 'top' ? 'O(n^d)' : 'O(n^{\\log_b a})'}</Tex>
                </td>
                <td className="mono" aria-label={r.case === c ? tx('uygulanan durum', 'case that applies') : tx('uygulanmaz', 'does not apply')}>
                  {tick(r.case === c)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout formal" role="status">
        <span className="label-tag">{tx('Neden bu durum?', 'Why this case?')}</span>
        <Tex>{`a = ${fmt(r.a)},\\quad b^d = ${fmt(r.b)}^{${fmt(r.d)}} = ${fmt(r.bd)},\\quad \\log_b a = ${fmt(r.logba)}`}</Tex>
        <p style={{ margin: '6px 0 0' }}>{r.explanation}</p>
        <p style={{ margin: '6px 0 0', fontSize: '1.05rem' }}>
          <Tex>{`\\Rightarrow\\ T(n) = O\\big(${r.bound}\\big)`}</Tex>
        </p>
      </div>
    </div>
  )
}

/** Level-by-level recursion tree: number of subproblems, size, work per subproblem and level total. */
export function RecursionTreeLevels({ a, b, d }: { a: number; b: number; d: number }) {
  const [exp, setExp] = useState(4)
  const n = b ** exp
  const levels = recursionLevels(a, b, d, n)
  const maxTotal = Math.max(...levels.map((l) => l.total))
  const sum = levels.reduce((s, l) => s + l.total, 0)
  const nice = Number.isInteger(b)
  return (
    <div>
      <h3>{tx('Özyineleme ağacı (c = 1 ile)', 'Recursion tree (with c = 1)')}</h3>
      <div className="row small">
        <label className="field">
          n = b^{exp} = {nice ? fmt(n) : n.toFixed(2)}
          <input type="range" min={1} max={nice && b ** 8 < 1e7 ? 8 : 5} value={exp} onChange={(e) => setExp(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} aria-label={tx('Ağaç derinliği (log_b n)', 'Tree depth (log_b n)')} />
        </label>
        <span className="muted">
          {tx('Toplam', 'Total')} = {fmt(sum, 1)}; {tx('kök işi', 'root work')} n^d = {fmt(n ** d, 1)}; {tx('yaprak sayısı', 'number of leaves')} a^{'{log_b n}'} = {fmt(a ** exp)}.
        </span>
      </div>
      <MiniTree a={a} levels={Math.min(levels.length, 4)} />
      <div className="table-wrap">
        <table className="data" aria-label={tx('Seviye toplamları', 'Level sums')}>
          <thead>
            <tr>
              <th>{tx('Seviye j', 'Level j')}</th>
              <th>{tx('Alt problem sayısı aʲ', 'Subproblems aʲ')}</th>
              <th>{tx('Boyut n/bʲ', 'Size n/bʲ')}</th>
              <th>{tx('Alt problem başına iş', 'Work per subproblem')}</th>
              <th>{tx('Seviye toplamı', 'Level total')}</th>
              <th style={{ width: '30%' }}>{tx('Göreli', 'Relative')}</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.level}>
                <td className="num">{l.level}</td>
                <td className="num">{fmt(l.count)}</td>
                <td className="num">{fmt(l.size, 2)}</td>
                <td className="num">{fmt(l.perNode, 2)}</td>
                <td className="num">{fmt(l.total, 1)}</td>
                <td>
                  <div className="progressbar" role="img" aria-label={tx(`Seviye toplamı, en büyüğün %${Math.round((l.total / maxTotal) * 100)}'i`, `Level total, ${Math.round((l.total / maxTotal) * 100)}% of the largest`)}>
                    <span style={{ width: `${(l.total / maxTotal) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        {tx('Seviye j’deki toplam iş', 'The total work on level j is')} <Tex>{`c\\,n^d\\,(a/b^d)^j`}</Tex>; {tx('oran', 'ratio')} <Tex>{`a/b^d = ${fmt(a / b ** d)}`}</Tex>.{' '}
        {tx('Oran 1 ise seviyeler eşit, < 1 ise azalan, > 1 ise artan geometrik dizi. Sonuç:', 'If the ratio is 1 the levels are equal; if < 1 a decreasing, if > 1 an increasing geometric series. Result:')} <Tex>{`O(${texPower(Math.abs(a - b ** d) < 1e-9 ? d : a < b ** d ? d : Math.log(a) / Math.log(b), Math.abs(a - b ** d) < 1e-9 ? 1 : 0)})`}</Tex>.
      </p>
    </div>
  )
}

function MiniTree({ a, levels }: { a: number; levels: number }) {
  const shownA = Math.min(a, 4)
  const leafCount = shownA ** (levels - 1)
  if (leafCount > 64) return null
  const W = Math.max(320, leafCount * 14)
  const H = levels * 34
  const nodes: { x: number; y: number; px?: number; py?: number }[] = []
  for (let l = 0; l < levels; l++) {
    const cnt = shownA ** l
    for (let i = 0; i < cnt; i++) {
      const x = ((i + 0.5) / cnt) * W
      const parentIdx = Math.floor(i / shownA)
      const pc = shownA ** (l - 1)
      nodes.push({ x, y: l * 34 + 10, px: l ? ((parentIdx + 0.5) / pc) * W : undefined, py: l ? (l - 1) * 34 + 10 : undefined })
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tree-svg" style={{ maxHeight: 160, margin: '8px 0 12px' }} role="img" aria-label={tx(`Ağacın ilk ${levels} seviyesi; her düğümün ${a} çocuğu var`, `The first ${levels} levels of the tree; every node has ${a} children`)}>
      {nodes.map((nd, i) => nd.px !== undefined && <line key={'l' + i} x1={nd.px} y1={nd.py} x2={nd.x} y2={nd.y} className="edge" />)}
      {nodes.map((nd, i) => (
        <circle key={i} cx={nd.x} cy={nd.y} r={Math.max(2.5, 7 - levels)} fill="var(--accent)" />
      ))}
      {a > 4 && (
        <text x={W - 4} y={12} textAnchor="end" fontSize={11} fill="var(--muted)">
          (a = {a}; {tx('yalnızca 4 çocuk çizildi', 'only 4 children drawn')})
        </text>
      )}
    </svg>
  )
}

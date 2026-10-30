import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { Tex } from '../components/Tex'
import { makeRng, randomPermutation } from '../engines/random'
import { groupFractions, groupRecurrenceRatio, medianOfMediansLayout, pivotSizes, substitutionConstant, type MomClass, type PivotRule } from '../engines/selectAnalysis'
import { locale, tx } from '../i18n/lang'

const fmtNum = (x: number, d = 0) => x.toLocaleString(locale(), { maximumFractionDigits: d, minimumFractionDigits: Number.isInteger(x) ? 0 : d })
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
/** The fraction 1 − (q+1)/(4q) = (3q − 1)/(4q) in lowest terms, as TeX. */
const restTex = (q: number) => {
  const g = gcd(3 * q - 1, 4 * q)
  return `\\tfrac{${(3 * q - 1) / g}}{${(4 * q) / g}}`
}
/** 1/q + (3q − 1)/(4q) = (3q + 3)/(4q), in lowest terms. */
const sumTex = (q: number) => {
  const num = 3 * q + 3
  const den = 4 * q
  const g = gcd(num, den)
  return g === den ? '1' : `\\tfrac{${num / g}}{${den / g}}`
}

/* ───────────── Pivot quality: sizes of the successive calls ───────────── */

const ruleLabel = (r: PivotRule) => ({ bad: tx('Kötü pivot', 'Bad pivot'), median: tx('Tam medyan', 'Exact median'), random: tx('Rastgele', 'Random') })[r]

export function PivotCompare() {
  const [n, setN] = useState(48)
  const [k, setK] = useState(15)
  const [rule, setRule] = useState<PivotRule>('bad')
  const [seed, setSeed] = useState(3)
  const kk = Math.min(k, n)
  const sizes = useMemo(() => pivotSizes(n, kk, rule, seed), [n, kk, rule, seed])
  const all = useMemo(() => (['bad', 'median', 'random'] as PivotRule[]).map((r) => ({ r, s: pivotSizes(n, kk, r, seed) })), [n, kk, seed])
  const sum = sizes.reduce((a, b) => a + b, 0)
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <div className="seg" role="group" aria-label={tx('Pivot kuralı', 'Pivot rule')}>
          {(['bad', 'median', 'random'] as PivotRule[]).map((r) => (
            <button key={r} aria-pressed={rule === r} onClick={() => setRule(r)}>
              {ruleLabel(r)}
            </button>
          ))}
        </div>
        <label className="field">
          n = {n}
          <input type="range" min={8} max={128} step={8} value={n} onChange={(e) => setN(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
        <label className="field">
          {tx('Aranan sıra', 'Target rank')} k = {kk}
          <input type="range" min={1} max={n} value={kk} onChange={(e) => setK(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
        <button className="btn sm" style={{ alignSelf: 'flex-end' }} onClick={() => setK(Math.ceil(n / 2))}>
          k = ⌈n/2⌉
        </button>
        {rule === 'random' && (
          <button className="btn sm" style={{ alignSelf: 'flex-end' }} onClick={() => setSeed((s) => s + 1)}>
            <Shuffle size={14} aria-hidden /> {tx('Yeni tohum', 'New seed')} ({seed})
          </button>
        )}
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <ol className="size-bars" key={rule + n + kk + seed} aria-label={tx('Ardışık çağrılardaki dizi boyları', 'Array sizes of the successive calls')}>
            {sizes.slice(0, 24).map((s, i) => (
              <li key={i} style={{ animationDelay: `${Math.min(i, 30) * 35}ms` }}>
                <span className="mono small muted">{i + 1}</span>
                <span className="size-bar" style={{ width: `${(s / n) * 100}%` }} />
                <span className="mono small">{s}</span>
              </li>
            ))}
          </ol>
          {sizes.length > 24 && <p className="small muted">{tx(`… ve ${sizes.length - 24} çağrı daha`, `… and ${sizes.length - 24} more calls`)}</p>}
        </div>
        <div className="viz-side">
          <dl className="kv" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div>
              <dt>{tx('çağrı sayısı', 'calls')}</dt>
              <dd>{sizes.length}</dd>
            </div>
            <div>
              <dt>{tx('boyların toplamı', 'sum of sizes')}</dt>
              <dd>{fmtNum(sum)}</dd>
            </div>
            <div>
              <dt>n(n+1)/2</dt>
              <dd>{fmtNum((n * (n + 1)) / 2)}</dd>
            </div>
            <div>
              <dt>2n</dt>
              <dd>{2 * n}</dd>
            </div>
          </dl>
          <table className="data" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>{tx('Kural', 'Rule')}</th>
                <th>{tx('Çağrı', 'Calls')}</th>
                <th>{tx('Toplam iş', 'Total work')}</th>
              </tr>
            </thead>
            <tbody>
              {all.map(({ r, s }) => (
                <tr key={r} className={r === rule ? 'hl' : ''}>
                  <td>{ruleLabel(r)}</td>
                  <td className="num">{s.length}</td>
                  <td className="num">{fmtNum(s.reduce((a, b) => a + b, 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted" style={{ marginTop: 8 }}>
            {tx(
              'Her çağrı boyuyla orantılı iş yapar (bölme), bu yüzden çubukların toplam uzunluğu toplam işi gösterir.',
              'Each call does work proportional to its size (the partition), so the total length of the bars shows the total work.',
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ───────────── Median of medians: which elements are certainly on each side ───────────── */

const STAGES = 5

const stageText = (st: number, pivot: number, g: number) =>
  [
    tx(`Dizi sırayla 5’erli ${g} gruba ayrıldı; her sütun bir grup (henüz sıralı değil).`, `The array is split, in order, into ${g} groups of 5; each column is one group (not sorted yet).`),
    tx('Her grup kendi içinde sıralandı: küçükler üstte. Grup başına sabit iş, toplam Θ(n).', 'Each group is sorted on its own: smaller values on top. Constant work per group, Θ(n) in total.'),
    tx('Grup medyanları (orta satır) seçildi. Bunlardan oluşan küçük dizinin medyanı pivot olacak.', 'The group medians (middle row) are picked. The median of this small array will be the pivot.'),
    tx(
      `Yalnızca düşünmek için sütunları medyanlarına göre dizdik: pivot ${pivot}, ortadaki sütunun ortasında. Algoritma bu sıralamayı yapmaz.`,
      `Only to reason about it, we order the columns by their medians: the pivot ${pivot} sits in the middle of the middle column. The algorithm does not do this.`,
    ),
    tx(
      'Sol üstteki her eleman, pivottan küçük bir medyana eşit ya da ondan küçük: kesin olarak pivottan küçük. Sağ alttakiler kesin büyük. Gri olanların tarafı girdiye bağlı.',
      'Every element in the top-left is at most a median that is smaller than the pivot: certainly smaller than the pivot. The bottom-right ones are certainly larger. The grey ones could go either way.',
    ),
  ][st]

const MOM_PRESET = [41, 7, 63, 28, 90, 15, 72, 34, 56, 3, 87, 49, 21, 68, 11, 95, 30, 59, 44, 82, 17, 76, 38, 5, 61, 26, 99, 52, 13, 70, 47, 84, 9, 33, 65]

export function MedianOfMediansGrid() {
  const [arr, setArr] = useState<number[]>(MOM_PRESET)
  const [stage, setStage] = useState(0)
  const [seed, setSeed] = useState(1)
  const L = useMemo(() => medianOfMediansLayout(arr), [arr])
  const W = 42
  const H = 40
  const cols = L.columns.length
  const randomize = (n: number) => {
    const s = seed + 1
    setSeed(s)
    setArr(randomPermutation(makeRng(s * 101), 99).slice(0, n))
    setStage(0)
  }
  const colX = (g: number) => (stage >= 3 ? L.order.indexOf(g) : g) * W
  const cls = (c: MomClass) => (stage >= 4 ? c : stage >= 3 && c === 'pivot' ? 'pivot' : 'none')
  const counts = { s: L.certainSmaller, g: L.certainGreater, u: arr.length - L.certainSmaller - L.certainGreater - 1 }
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <span className="small muted">{tx('Dizi boyu', 'Array size')}:</span>
        <div className="seg" role="group" aria-label={tx('Dizi boyu', 'Array size')}>
          {[15, 25, 35, 45].map((n) => (
            <button key={n} aria-pressed={arr.length === n} onClick={() => randomize(n)}>
              {n}
            </button>
          ))}
        </div>
        <button className="btn sm" onClick={() => randomize(arr.length)}>
          <Shuffle size={14} aria-hidden /> {tx('Yeni rastgele dizi', 'New random array')}
        </button>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <div className="mom-grid" style={{ width: cols * W, height: 5 * H + 26 }} role="img" aria-label={stageText(stage, L.pivot, cols)}>
            {L.columns.map((c) => (
              <span key={'g' + c.group} className="mom-colhead mono" style={{ transform: `translate(${colX(c.group)}px, 0)` }}>
                G{c.group + 1}
              </span>
            ))}
            {L.columns.flatMap((c) => {
              const orig = arr.slice(c.group * 5, c.group * 5 + 5)
              return orig.map((v, oi) => {
                const sortedIdx = c.values.indexOf(v)
                const row = stage >= 1 ? sortedIdx : oi
                const isMed = stage >= 2 && sortedIdx === c.medianIdx
                const klass = cls(c.classes[sortedIdx])
                return (
                  <span
                    key={c.group + ':' + oi}
                    className={`mom-cell mono st-${klass}${isMed ? ' med' : ''}`}
                    style={{ transform: `translate(${colX(c.group)}px, ${22 + row * H}px)` }}
                  >
                    {v}
                    {klass === 'smaller' && <i aria-hidden>&lt;</i>}
                    {klass === 'greater' && <i aria-hidden>&gt;</i>}
                    {klass === 'pivot' && <i aria-hidden>P</i>}
                  </span>
                )
              })
            })}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn icon" onClick={() => setStage((s) => Math.max(0, s - 1))} disabled={stage === 0} aria-label={tx('Önceki adım', 'Previous step')}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button className="btn primary" onClick={() => setStage((s) => Math.min(STAGES - 1, s + 1))} disabled={stage === STAGES - 1}>
              {tx('Sonraki adım', 'Next step')} <ChevronRight size={16} aria-hidden />
            </button>
            <span className="mono small muted">
              {stage + 1} / {STAGES}
            </span>
          </div>
          <p className="explain" aria-live="polite" style={{ marginTop: 10 }}>
            <span key={stage} className="explain-text">
              {stageText(stage, L.pivot, cols)}
            </span>
          </p>
        </div>
        <div className="viz-side">
          <span className="label-tag">{tx('Sayılar', 'Counts')}</span>
          <table className="data">
            <tbody>
              <tr>
                <td>{tx('Pivot (medyanların medyanı)', 'Pivot (median of medians)')}</td>
                <td className="num">{stage >= 3 ? L.pivot : '?'}</td>
              </tr>
              <tr>
                <td>{tx('Kesin küçük', 'Certainly smaller')}</td>
                <td className="num">{stage >= 4 ? counts.s : '?'}</td>
              </tr>
              <tr>
                <td>{tx('Kesin büyük', 'Certainly larger')}</td>
                <td className="num">{stage >= 4 ? counts.g : '?'}</td>
              </tr>
              <tr>
                <td>{tx('Belirsiz', 'Undetermined')}</td>
                <td className="num">{stage >= 4 ? counts.u : '?'}</td>
              </tr>
              <tr>
                <td>
                  {tx('Lemma alt sınırı', 'Lemma lower bound')} <Tex>{'3(\\lceil g/2\\rceil - 2)'}</Tex>
                </td>
                <td className="num">{L.lemmaBound}</td>
              </tr>
              <tr className="hl">
                <td>
                  {tx('Gerçek', 'Actual')} |L| / |R|
                </td>
                <td className="num">{stage >= 4 ? `${L.less} / ${L.greater}` : '?'}</td>
              </tr>
              <tr>
                <td>
                  <Tex>{'7n/10 + 5'}</Tex>
                </td>
                <td className="num">{fmtNum((7 * arr.length) / 10 + 5, 1)}</td>
              </tr>
            </tbody>
          </table>
          <p className="small muted" style={{ marginTop: 8 }}>
            {tx(
              'Lemma, pivotun kendi grubunu ve eksik kalabilecek son grubu saymadığı için şekildeki sayıdan daha küçük, ama her girdi için geçerli bir sınır verir.',
              'The lemma does not count the pivot’s own group or a possibly incomplete last group, so it gives a smaller number than the figure — but one that holds for every input.',
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ───────────── Why groups of 5? Recursion trees for different group sizes ───────────── */

export function GroupSizeTree() {
  const [q, setQ] = useState(5)
  const n = 1000
  const { pivot, rest } = groupFractions(q)
  const levels = useMemo(() => {
    const out: number[][] = [[n]]
    for (let l = 1; l < 5; l++) out.push(out[l - 1].flatMap((s) => (s > 1 ? [s * pivot, s * rest] : [])))
    return out
  }, [pivot, rest])
  const C = substitutionConstant(q)
  const ratios = useMemo(() => [100, 10_000, 1_000_000, 10_000_000].map((m) => [3, 5, 7].map((g) => groupRecurrenceRatio(g, m))), [])
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <span className="small muted">{tx('Grup boyu', 'Group size')}:</span>
        <div className="seg" role="group" aria-label={tx('Grup boyu', 'Group size')}>
          {[3, 5, 7, 9].map((g) => (
            <button key={g} aria-pressed={q === g} onClick={() => setQ(g)}>
              {g}
            </button>
          ))}
        </div>
        <Tex>{`T(n) \\le T\\!\\left(\\tfrac{n}{${q}}\\right) + T\\!\\left(${restTex(q)}\\,n\\right) + n`}</Tex>
      </div>
      <div className="viz-stage">
        <div className="gtree" key={q}>
          {levels.map((lv, l) => {
            const total = lv.reduce((a, b) => a + b, 0)
            return (
              <div key={l} className="gtree-row" style={{ animationDelay: `${l * 90}ms` }}>
                <span className="mono small muted">{l}</span>
                <div className="gtree-boxes">
                  {lv.map((s, i) => (
                    <span key={i} className="gtree-box" style={{ width: `${(s / n) * 100}%` }} title={fmtNum(s, 1)}>
                      {s / n > 0.08 ? fmtNum(s, 0) : ''}
                    </span>
                  ))}
                </div>
                <span className="mono small">{fmtNum(Math.round(total * 10) / 10, 1)}</span>
              </div>
            )
          })}
        </div>
        <div className={'callout ' + (C === null ? 'warn' : 'formal')} role="status" style={{ marginTop: 12 }}>
          {tx('Oranların toplamı', 'Sum of the ratios')} <Tex>{`\\tfrac{1}{${q}} + ${restTex(q)} = ${sumTex(q)}`}</Tex>.{' '}
          {C === null
            ? tx(
                'Toplam 1: her tam seviye yaklaşık n iş yapar, bu basit analizle yalnızca O(n log n) üst sınırı çıkar.',
                'The sum is 1: every full level does about n work, so this simple analysis only gives an O(n log n) upper bound.',
              )
            : tx(
                `Toplam 1’den küçük: seviye işleri geometrik olarak azalır ve yerine koyma adımı C ≥ ${fmtNum(C, 2)} ile tutar → O(n).`,
                `The sum is below 1: level work shrinks geometrically and the substitution step works with C ≥ ${fmtNum(C, 2)} → O(n).`,
              )}
        </div>
        <span className="label-tag" style={{ marginTop: 12 }}>
          {tx('Sayısal deney: U(n)/n (model bağıntısı, ölçüm değil)', 'Numerical experiment: U(n)/n (the model recurrence, not a measurement)')}
        </span>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>n</th>
                <th>{tx('3’lü', 'groups of 3')}</th>
                <th>{tx('5’li', 'groups of 5')}</th>
                <th>{tx('7’li', 'groups of 7')}</th>
              </tr>
            </thead>
            <tbody>
              {[100, 10_000, 1_000_000, 10_000_000].map((m, i) => (
                <tr key={m}>
                  <td className="num">
                    <Tex>{`10^{${Math.round(Math.log10(m))}}`}</Tex>
                  </td>
                  {ratios[i].map((r, j) => (
                    <td key={j} className={'num' + ([3, 5, 7][j] === q ? ' hl-cell' : '')}>
                      {fmtNum(r, 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          {tx(
            '3’lü grupların oranı log n gibi büyümeye devam eder; 5’li ve 7’li grupların oranı sınırlı kalır. Kutuların genişliği alt problem boyuyla orantılıdır, sağdaki sayı seviyenin toplam boyudur.',
            'For groups of 3 the ratio keeps growing like log n; for groups of 5 and 7 it stays bounded. Box widths are proportional to subproblem sizes; the number on the right is the level’s total size.',
          )}
        </p>
      </div>
    </div>
  )
}

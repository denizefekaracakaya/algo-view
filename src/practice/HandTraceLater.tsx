import { useMemo, type ReactNode } from 'react'
import { ArrayView, type CellSpec } from '../components/ArrayView'
import { GraphView, type Tone } from '../components/GraphView'
import { Grid } from '../components/VizParts'
import { tx } from '../i18n/lang'
import { useDrill, type DrillProps } from './useDrill'
import { DrillFrame } from './DrillFrame'
import {
  bfsDrill,
  bfsDrillGraph,
  dfsDrill,
  dfsDrillGraph,
  dijkstraDrill,
  dijkstraDrillGraph,
  FINISH,
  gsDrill,
  gsDrillInput,
  HASH_N,
  HASH_P,
  hashDrill,
  huffmanDrill,
  huffmanDrillInput,
  kruskalDrill,
  kruskalDrillGraph,
  lcsDrill,
  lcsDrillInput,
} from './drillsLater'

const Info = ({ children }: { children: ReactNode }) => (
  <p className="small" style={{ margin: 0 }}>
    {children}
  </p>
)

export function HashDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { steps, a, b, keys, final } = useMemo(() => hashDrill(seed), [seed])
  const d = useDrill(steps, 'hash')
  const s = d.step
  const buckets = s ? s.buckets : final
  const cells: CellSpec[] = keys.map((x, k) => ({ value: x, state: !s || k < s.pos ? 'sorted' : k === s.pos ? 'active' : 'none' }))
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            <span className="mono">
              h(x) = (({a}·x + {b}) mod {HASH_P}) mod {HASH_N}
            </span>{' '}
            · {tx('zincirleme (chaining)', 'chaining')}
          </Info>
          <ArrayView cells={cells} bars={false} showIndex={false} label={tx('Eklenecek anahtarlar', 'Keys to insert')} />
          <div className="drill-buckets" role="group" aria-label={tx('Kovalar', 'Buckets')}>
            {buckets.map((c, k) => (
              <button key={k} className="bucket" disabled={!s} onClick={() => d.choose(k)} aria-label={tx(`Kova ${k}: ${c.join(', ') || 'boş'}`, `Bucket ${k}: ${c.join(', ') || 'empty'}`)}>
                <span className="bucket-items mono">
                  {c.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </span>
                <span className="bucket-label mono">{k}</span>
              </button>
            ))}
          </div>
        </div>
      }
      prompt={s && tx(`${keys[s.pos]} hangi kovaya düşer? Kovaya tıkla.`, `Which bucket does ${keys[s.pos]} land in? Click the bucket.`)}
      controls={null}
    />
  )
}

export function BfsDrillView({ seed, onNew, onRestart }: DrillProps) {
  const g = useMemo(() => bfsDrillGraph(seed), [seed])
  const { steps, dist } = useMemo(() => bfsDrill(g), [g])
  const d = useDrill(steps, 'bfs')
  const s = d.step
  const known = s ? s.dist : dist
  const tone = (v: string): Tone => (!s ? (known[v] !== undefined ? 'done' : 'muted') : s.done.includes(v) ? 'done' : s.options.includes(v) ? 'frontier' : 'default')
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            {tx('Kaynak s. Yeşil: işlendi; mavi: keşfedildi, kuyrukta. Alt yazı: katman (uzaklık). Komşular alfabetik sırayla taranır.', 'Source s. Green: processed; blue: discovered, in the queue. Caption: layer (distance). Neighbors are scanned alphabetically.')}
          </Info>
          <GraphView graph={g} label={tx('BFS grafiği', 'BFS graph')} node={(v) => ({ tone: tone(v), sub: known[v] !== undefined ? `d=${known[v]}` : undefined, tag: v === 's' ? tx('kaynak', 'source') : undefined })} />
        </div>
      }
      prompt={s && tx('Kuyruktan sıradaki çıkan (işlenen) düğüm hangisi?', 'Which node leaves the queue (is processed) next?')}
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

export function DfsDrillView({ seed, onNew, onRestart }: DrillProps) {
  const g = useMemo(() => dfsDrillGraph(seed), [seed])
  const res = useMemo(() => dfsDrill(g), [g])
  const d = useDrill(res.steps, 'dfs')
  const s = d.step
  const dd = s ? s.d : res.d
  const ff = s ? s.f : res.f
  const top = s?.stack.at(-1)
  const tone = (v: string): Tone => (ff[v] !== undefined ? 'done' : v === top ? 'active' : dd[v] !== undefined ? 'frontier' : 'default')
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            {tx('Alt yazı: d/f zamanları. Komşular alfabetik sırayla taranır; yeni arama alfabetik ilk beyaz düğümden başlar.', 'Caption: d/f times. Neighbors are scanned alphabetically; a new search starts from the alphabetically first white node.')}
            {s && (
              <>
                {' '}
                · {tx('Yığın', 'Stack')}: <span className="mono">{s.stack.join(', ') || '—'}</span> · t = <span className="mono">{s.time}</span>
              </>
            )}
          </Info>
          <GraphView graph={g} label={tx('DFS grafiği', 'DFS graph')} node={(v) => ({ tone: tone(v), sub: dd[v] !== undefined ? `${dd[v]}/${ff[v] ?? '–'}` : undefined })} />
        </div>
      }
      prompt={s && tx('Sıradaki olay ne?', 'What is the next event?')}
      controls={
        s &&
        s.options.map((v, k) => (
          <button key={v} className="btn sm" onClick={() => d.choose(k)}>
            {v === FINISH ? tx(`${top} biter`, `${top} finishes`) : tx(`${v} keşfedilir`, `${v} is discovered`)}
          </button>
        ))
      }
    />
  )
}

export function DijkstraDrillView({ seed, onNew, onRestart }: DrillProps) {
  const g = useMemo(() => dijkstraDrillGraph(seed), [seed])
  const { steps, dist } = useMemo(() => dijkstraDrill(g), [g])
  const d = useDrill(steps, 'dijkstra')
  const s = d.step
  const final = s ? Object.fromEntries(s.final) : dist
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>{tx('Yalnızca kesinleşen uzaklıklar gösteriliyor; geçici uzaklıkları kafanda (ya da kâğıtta) tut.', 'Only finalized distances are shown; keep the tentative ones in your head (or on paper).')}</Info>
          <GraphView
            graph={g}
            label={tx('Dijkstra grafiği', 'Dijkstra graph')}
            node={(v) => ({ tone: s?.node === v ? 'active' : final[v] !== undefined ? 'done' : 'default', sub: final[v] !== undefined ? `d=${final[v]}` : undefined, tag: v === 's' ? tx('kaynak', 'source') : undefined })}
          />
        </div>
      }
      prompt={s && (s.kind === 'pick' ? tx('Sıradaki kesinleşen düğüm hangisi?', 'Which node is finalized next?') : tx(`d(${s.node}) kaç?`, `What is d(${s.node})?`))}
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

export function LcsDrillView({ seed, onNew, onRestart }: DrillProps) {
  const { X, Y } = useMemo(() => lcsDrillInput(seed), [seed])
  const { steps, table } = useMemo(() => lcsDrill(X, Y), [X, Y])
  const d = useDrill(steps, 'lcs')
  const s = d.step
  const T = s ? s.table : table
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            X = <span className="mono">{X}</span>, Y = <span className="mono">{Y}</span>. {tx('C[i][j] = X’in ilk i ve Y’nin ilk j harfinin LCS uzunluğu.', 'C[i][j] = LCS length of the first i letters of X and the first j letters of Y.')}
          </Info>
          <Grid
            caption={tx('LCS tablosu', 'LCS table')}
            colHead={['', ...Y]}
            rowHead={['', ...X]}
            cells={T.map((r, i) => r.map((c, j) => (s && s.i === i && s.j === j ? '?' : c === null ? '' : String(c))))}
            tone={(i, j) => (!s ? undefined : s.i === i && s.j === j ? 'cur' : (i === s.i - 1 && (j === s.j || j === s.j - 1)) || (i === s.i && j === s.j - 1) ? 'from' : undefined)}
          />
          {!s && (
            <Info>
              {tx('LCS uzunluğu', 'LCS length')}: <strong className="mono">{table[X.length][Y.length]}</strong>
            </Info>
          )}
        </div>
      }
      prompt={s && tx(`C[${s.i}][${s.j}] kaç? (X[${s.i}] = ${X[s.i - 1]}, Y[${s.j}] = ${Y[s.j - 1]})`, `What is C[${s.i}][${s.j}]? (X[${s.i}] = ${X[s.i - 1]}, Y[${s.j}] = ${Y[s.j - 1]})`)}
      controls={
        s &&
        Array.from({ length: Math.min(s.i, s.j) + 1 }, (_, k) => (
          <button key={k} className="btn sm mono" onClick={() => d.choose(k)}>
            {k}
          </button>
        ))
      }
    />
  )
}

export function HuffmanDrillView({ seed, onNew, onRestart }: DrillProps) {
  const chars = useMemo(() => huffmanDrillInput(seed), [seed])
  const { steps, cost, root } = useMemo(() => huffmanDrill(chars), [chars])
  const d = useDrill(steps, 'huffman')
  const s = d.step
  const forest = s ? s.forest : [root]
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            {tx('Sıklıklar', 'Frequencies')}: <span className="mono">{chars.map(([c, f]) => `${c}=${f}`).join(', ')}</span>
            {s && (
              <>
                {' '}
                · {tx('Tur', 'Round')} {s.round}
              </>
            )}
          </Info>
          <div className="drill-groups" aria-label={tx('Orman', 'Forest')}>
            {forest.map((t) => (
              <span key={t.label} className={'drill-chip mono' + (s?.picked === t ? ' median' : '') + (!s ? ' pivot' : '')}>
                {t.label}: {t.freq}
              </span>
            ))}
          </div>
          {!s && (
            <Info>
              {tx(`Tek ağaç kaldı. Toplam kodlama maliyeti Σ f·derinlik = birleştirmelerin toplamı = ${cost}.`, `One tree is left. The total encoding cost Σ f·depth = the sum of the merges = ${cost}.`)}
            </Info>
          )}
        </div>
      }
      prompt={s && (s.picked ? tx(`${s.picked.label} seçildi. Birlikte birleştirilecek ikinci düğüm hangisi?`, `${s.picked.label} is picked. Which node is merged with it?`) : tx('Bu turda birleştirilecek ilk düğüm (en küçük anahtar) hangisi?', 'Which node is merged first in this round (the smallest key)?'))}
      controls={
        s &&
        s.options.map((k, i) => (
          <button key={k} className="btn sm mono" onClick={() => d.choose(i)}>
            {s.forest[k].label}: {s.forest[k].freq}
          </button>
        ))
      }
    />
  )
}

export function KruskalDrillView({ seed, onNew, onRestart }: DrillProps) {
  const g = useMemo(() => kruskalDrillGraph(seed), [seed])
  const res = useMemo(() => kruskalDrill(g), [g])
  const d = useDrill(res.steps, 'kruskal')
  const s = d.step
  const tree = s ? s.tree : res.tree
  const cur = s ? s.order[s.pos] : null
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="stack">
          <Info>
            {s ? (
              <>
                {tx('Kümeler', 'Sets')}:{' '}
                <span className="mono">
                  {s.sets.map((x) => '{' + x.join(',') + '}').join(' ')}
                </span>
              </>
            ) : (
              tx(`Bitti: MST ağırlığı ${res.weight}.`, `Done: the MST weight is ${res.weight}.`)
            )}
          </Info>
          <GraphView
            graph={g}
            label={tx('Kruskal grafiği', 'Kruskal graph')}
            edge={(_, i) => (i === cur ? { tone: 'active' } : tree.includes(i) ? { tone: 'tree' } : s?.skipped.includes(i) || !s ? { tone: 'muted', dashed: true } : {})}
          />
        </div>
      }
      prompt={s && tx(`Sıradaki kenar: ${g.edges[cur!].u}–${g.edges[cur!].v} (${g.edges[cur!].w}). Ne olur?`, `Next edge: ${g.edges[cur!].u}–${g.edges[cur!].v} (${g.edges[cur!].w}). What happens?`)}
      controls={
        s && (
          <>
            <button className="btn sm" onClick={() => d.choose(0)}>
              {tx('Ağaca ekle', 'Add to the tree')}
            </button>
            <button className="btn sm" onClick={() => d.choose(1)}>
              {tx('Atla (döngü kapatır)', 'Skip (closes a cycle)')}
            </button>
          </>
        )
      }
    />
  )
}

export function GsDrillView({ seed, onNew, onRestart }: DrillProps) {
  const p = useMemo(() => gsDrillInput(seed), [seed])
  const res = useMemo(() => gsDrill(p), [p])
  const d = useDrill(res.steps, 'gale-shapley')
  const s = d.step
  const match = s ? s.match : res.match
  const hospOf = (doc: string) => p.hospitals.find((h) => match[h] === doc)
  return (
    <DrillFrame
      d={d}
      onNew={onNew}
      onRestart={onRestart}
      stage={
        <div className="match-grid">
          <div>
            <div className="label-tag">{tx('Doktorlar (en çok istenenden aza)', 'Doctors (most to least preferred)')}</div>
            <ul className="pref-list">
              {p.doctors.map((doc) => (
                <li key={doc} className={s?.d === doc ? 'current' : undefined}>
                  <strong>{doc}</strong>
                  <span className="pref-row">
                    {p.dPref[doc].map((h, k) => (
                      <span key={h} className={'pref ' + (hospOf(doc) === h ? 'matched' : s?.d === doc && s.h === h ? 'proposing' : s && k < s.next[doc] ? 'tried' : '')}>
                        {h}
                      </span>
                    ))}
                  </span>
                  {!hospOf(doc) && <span className="small muted">{tx('boşta', 'free')}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label-tag">{tx('Hastaneler (en çok istenenden aza)', 'Hospitals (most to least preferred)')}</div>
            <ul className="pref-list">
              {p.hospitals.map((h) => (
                <li key={h} className={s?.h === h ? 'current' : undefined}>
                  <strong>{h}</strong>
                  <span className="pref-row">
                    {p.hPref[h].map((doc) => (
                      <span key={doc} className={'pref ' + (match[h] === doc ? 'matched' : s?.h === h && s.d === doc ? 'proposing' : '')}>
                        {doc}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      prompt={s && tx(`${s.d}, ${s.h}’ye başvuruyor${s.match[s.h] ? ` (${s.h} şu an ${s.match[s.h]} ile)` : ''}. ${s.h} ne yapar?`, `${s.d} applies to ${s.h}${s.match[s.h] ? ` (${s.h} currently holds ${s.match[s.h]})` : ''}. What does ${s.h} do?`)}
      controls={
        s && (
          <>
            <button className="btn sm" onClick={() => d.choose(0)}>
              {tx('Kabul eder (geçici)', 'Accepts (tentatively)')}
            </button>
            <button className="btn sm" onClick={() => d.choose(1)}>
              {tx('Reddeder', 'Rejects')}
            </button>
          </>
        )
      }
    />
  )
}

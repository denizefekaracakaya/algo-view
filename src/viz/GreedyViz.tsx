import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { KV, Legend } from '../components/VizParts'
import { ACTIVITIES, ACTIVITY_CODE, HUFFMAN_CODE, HUFFMAN_EXAMPLE, activityTrace, huffmanTrace, type Activity, type HNode } from '../engines/greedy'
import { makeRng, randInt } from '../engines/random'
import { tx } from '../i18n/lang'

export function ActivityViz() {
  const [acts, setActs] = useState<Activity[]>(ACTIVITIES)
  const { trace } = useMemo(() => activityTrace(acts), [acts])
  const maxT = Math.max(...acts.map((a) => a.f))
  const shuffle = () => {
    const rng = makeRng(Date.now() % 10007)
    setActs(
      Array.from({ length: 10 }, (_, i) => {
        const s = randInt(rng, 0, 13)
        return { name: String.fromCharCode(97 + i), s, f: s + randInt(rng, 1, 5) }
      }),
    )
  }
  return (
    <TraceViewer
      key={acts.map((a) => a.name + a.s + a.f).join()}
      trace={trace}
      label={tx('Etkinlik seçimi görselleştirmesi', 'Activity selection visualization')}
      code={ACTIVITY_CODE}
      toolbar={
        <>
          <button className="btn" type="button" onClick={() => setActs(ACTIVITIES)}>
            {tx('Örnek gün', 'Example day')}
          </button>
          <button className="btn" type="button" onClick={shuffle}>
            {tx('Rastgele etkinlikler', 'Random activities')}
          </button>
        </>
      }
      render={(step) => {
        const s = step.state
        return (
          <div className="timeline" role="list" aria-label={tx('Bitiş zamanına göre sıralı etkinlikler', 'Activities sorted by finish time')}>
            {s.sorted.map((a) => {
              const st = s.chosen.includes(a.name) ? 'chosen' : s.rejected.includes(a.name) ? 'rejected' : s.current === a.name ? 'current' : ''
              return (
                <div key={a.name} className="timeline-row" role="listitem" aria-label={`${a.name} [${a.s}, ${a.f}) ${st}`}>
                  <span className="mono small timeline-name">{a.name}</span>
                  <span className="timeline-track">
                    <span className={'timeline-bar ' + st + (s.current === a.name ? ' current' : '')} style={{ left: `${(a.s / maxT) * 100}%`, width: `${((a.f - a.s) / maxT) * 100}%` }}>
                      {a.s}–{a.f}
                    </span>
                    {s.lastFinish !== null && s.current === a.name && <span className="timeline-line" style={{ left: `${(s.lastFinish / maxT) * 100}%` }} aria-hidden />}
                  </span>
                </div>
              )
            })}
          </div>
        )
      }}
      side={(step) => <KV items={[[tx('seçilen', 'chosen'), '{' + step.state.chosen.join(', ') + '}'], [tx('son bitiş', 'last finish'), step.state.lastFinish ?? '—']]} />}
      legend={
        <Legend
          items={[
            { color: 'var(--st-sorted-bg)', border: 'var(--st-sorted)', label: tx('seçildi', 'chosen') },
            { color: 'var(--st-elim-bg)', border: 'var(--st-elim)', label: tx('çakıştı, atlandı', 'overlapped, skipped') },
            { color: 'var(--st-compare-bg)', border: 'var(--st-compare)', label: tx('inceleniyor (dikey çizgi: son seçilenin bitişi)', 'being examined (vertical line: finish of the last chosen)') },
          ]}
        />
      }
    />
  )
}

interface Laid {
  n: HNode
  x: number
  y: number
}

function layout(root: HNode, x0: number, x1: number, y: number, out: Laid[]) {
  out.push({ n: root, x: (x0 + x1) / 2, y })
  if (root.left) layout(root.left, x0, (x0 + x1) / 2, y + 62, out)
  if (root.right) layout(root.right, (x0 + x1) / 2, x1, y + 62, out)
}

const depth = (n: HNode): number => 1 + Math.max(n.left ? depth(n.left) : 0, n.right ? depth(n.right) : 0)
const leaves = (n: HNode): number => (!n.left && !n.right ? 1 : (n.left ? leaves(n.left) : 0) + (n.right ? leaves(n.right) : 0))

export function HuffmanViz() {
  const [text, setText] = useState(HUFFMAN_EXAMPLE.map(([c, f]) => `${c}:${f}`).join(', '))
  const [chars, setChars] = useState(HUFFMAN_EXAMPLE)
  const [err, setErr] = useState<string | null>(null)
  const { trace } = useMemo(() => huffmanTrace(chars), [chars])
  const apply = () => {
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean)
    const parsed: [string, number][] = []
    for (const p of parts) {
      const m = /^([^\s:]{1,3})\s*:\s*(\d{1,4})$/.exec(p)
      if (!m || Number(m[2]) <= 0) {
        setErr(tx(`“${p}” anlaşılamadı. Biçim: karakter:sıklık, ör. a:45`, `Could not read “${p}”. Format: character:frequency, e.g. a:45`))
        return
      }
      parsed.push([m[1], Number(m[2])])
    }
    if (parsed.length < 2 || parsed.length > 10 || new Set(parsed.map((p) => p[0])).size !== parsed.length) {
      setErr(tx('2 ile 10 arasında farklı karakter girin.', 'Enter between 2 and 10 distinct characters.'))
      return
    }
    setErr(null)
    setChars(parsed)
  }
  return (
    <TraceViewer
      key={chars.map((c) => c.join(':')).join()}
      trace={trace}
      label={tx('Huffman kodlaması görselleştirmesi', 'Huffman coding visualization')}
      code={HUFFMAN_CODE}
      toolbar={
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          <label className="field" style={{ flex: '1 1 260px' }}>
            {tx('Karakterler ve sıklıklar', 'Characters and frequencies')}
            <input className="input mono" value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!err} />
          </label>
          <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
            {tx('Uygula', 'Apply')}
          </button>
          {err && (
            <div className="error-msg" role="alert" style={{ flexBasis: '100%' }}>
              {err}
            </div>
          )}
        </form>
      }
      render={(step) => {
        const s = step.state
        const forest = [...s.forest].sort((a, b) => a.freq - b.freq || a.id - b.id)
        const total = forest.reduce((sum, t) => sum + leaves(t), 0)
        const H = Math.max(...forest.map(depth)) * 62 + 30
        const items: Laid[] = []
        let x = 0
        for (const t of forest) {
          const w = (leaves(t) / total) * 560
          layout(t, x, x + w, 26, items)
          x += w
        }
        const edges = items.flatMap((it) => [it.n.left, it.n.right].filter(Boolean).map((c, k) => ({ from: it, to: items.find((o) => o.n === c)!, bit: k })))
        return (
          <svg className="graph-svg" viewBox={`0 0 560 ${H}`} role="img" aria-label={tx('Huffman ormanı: ', 'Huffman forest: ') + forest.map((t) => `${t.label || tx('iç düğüm', 'internal node')} ${t.freq}`).join(', ')}>
            {edges.map((e, i) => (
              <g key={i}>
                <line x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke="var(--border-strong)" strokeWidth={2} />
                <text className="g-sub" x={(e.from.x + e.to.x) / 2 + (e.bit ? 6 : -10)} y={(e.from.y + e.to.y) / 2}>
                  {e.bit}
                </text>
              </g>
            ))}
            {items.map((it) => {
              const merged = s.merged.includes(it.n.id)
              const leaf = !it.n.left && !it.n.right
              return (
                <g key={it.n.id} transform={`translate(${it.x}, ${it.y})`}>
                  <circle r={17} fill={merged ? 'var(--st-compare-bg)' : leaf ? 'var(--st-less-bg)' : 'var(--surface)'} stroke={merged ? 'var(--st-compare)' : leaf ? 'var(--st-less)' : 'var(--border-strong)'} strokeWidth={2.2} />
                  <text className="g-id" textAnchor="middle" dy={leaf ? -1 : 5}>
                    {leaf ? it.n.label : it.n.freq}
                  </text>
                  {leaf && (
                    <text className="g-sub" textAnchor="middle" dy="12">
                      {it.n.freq}
                    </text>
                  )}
                  {leaf && s.codes && (
                    <text className="g-tag" textAnchor="middle" y={32}>
                      {s.codes[it.n.label]}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )
      }}
      side={(step) => <KV items={[[tx('ağaç sayısı', 'trees'), step.state.forest.length]]} />}
      legend={<span className="muted">{tx('Mavi: karakter (yaprak) ve sıklığı; iç düğümde alt ağacın toplam sıklığı. Sarı: bu adımda oluşan düğüm. Sol kenar 0, sağ kenar 1. Varsayılan sıklıklar Ders 14 notlarındaki örnektendir.', 'Blue: a character (leaf) and its frequency; an internal node shows the total frequency of its subtree. Yellow: the node created in this step. Left edge 0, right edge 1. The default frequencies are the example from the Lecture 14 notes.')}</span>}
    />
  )
}

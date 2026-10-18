import { useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Eye, RefreshCw, RotateCcw, XCircle } from 'lucide-react'
import { ArrayView, type CellSpec } from '../components/ArrayView'
import { TreeView } from '../components/TreeView'
import type { NodeRole } from '../engines/bst'
import { useProgress } from '../state/ProgressContext'
import { tx } from '../i18n/lang'
import { bstDrill, drillInput, insertionDrill, mergeDrill, momDrill, partitionDrill, radixDrill, type DrillId, type DrillStepBase } from './drills'

interface Feedback {
  ok: boolean
  text: string
}

/** Step machine shared by all drills: a wrong choice costs a mistake and shows a hint; a right one advances. */
function useDrill<S extends DrillStepBase>(steps: S[], id: DrillId) {
  const { dispatch } = useProgress()
  const [idx, setIdx] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const step = idx < steps.length ? steps[idx] : null
  const advance = (m: number) => {
    const next = idx + 1
    setIdx(next)
    if (next === steps.length) dispatch({ type: 'drill', id, mistakes: m })
  }
  const choose = (v: number) => {
    if (!step) return
    if (v === step.answer) {
      setFb({ ok: true, text: step.why })
      advance(mistakes)
    } else {
      setMistakes(mistakes + 1)
      setFb({ ok: false, text: step.hint })
    }
  }
  const reveal = () => {
    if (!step) return
    setMistakes(mistakes + 1)
    setFb({ ok: true, text: tx('Gösterildi (hata sayıldı): ', 'Shown (counted as a mistake): ') + step.why })
    advance(mistakes + 1)
  }
  return { idx, step, total: steps.length, done: !step, mistakes, fb, choose, reveal }
}

type Drill = ReturnType<typeof useDrill>

function DrillFrame({ d, prompt, stage, controls, onNew, onRestart }: { d: Drill; prompt: ReactNode; stage: ReactNode; controls: ReactNode; onNew: () => void; onRestart: () => void }) {
  return (
    <div className="card viz drill">
      <div className="viz-toolbar">
        <span className="step-count mono">
          {tx('Adım', 'Step')} {Math.min(d.idx + 1, d.total)} / {d.total}
        </span>
        <span className={'badge ' + (d.mistakes ? 'progress' : 'done')}>
          {d.mistakes} {tx('hata', d.mistakes === 1 ? 'mistake' : 'mistakes')}
        </span>
        <span className="spacer" />
        <button className="btn sm ghost" onClick={onRestart}>
          <RotateCcw size={14} aria-hidden /> {tx('Baştan', 'Restart')}
        </button>
        <button className="btn sm" onClick={onNew}>
          <RefreshCw size={14} aria-hidden /> {tx('Yeni girdi', 'New input')}
        </button>
      </div>
      <div className="viz-stage">{stage}</div>
      <div className="drill-panel">
        {d.done ? (
          <div className="feedback ok drill-done" role="status">
            <CheckCircle2 size={16} aria-hidden />{' '}
            <strong>
              {d.mistakes === 0
                ? tx('Tamamlandı, hiç hata yok!', 'Done, without a single mistake!')
                : tx(`Tamamlandı: ${d.total} adımda ${d.mistakes} hata.`, `Done: ${d.mistakes} mistake(s) in ${d.total} steps.`)}
            </strong>{' '}
            {d.mistakes > 0 ? tx('Aynı girdiyle baştan dene ya da yeni bir girdi al.', 'Try the same input again or get a new one.') : tx('Yeni bir girdiyle tekrar dene.', 'Try again with a new input.')}
          </div>
        ) : (
          <>
            <p className="drill-prompt">{prompt}</p>
            <div className="drill-controls" role="group" aria-label={tx('Seçenekler', 'Choices')}>
              {controls}
            </div>
            <button className="btn sm ghost" onClick={d.reveal}>
              <Eye size={14} aria-hidden /> {tx('Bu adımı göster', 'Show this step')}
            </button>
          </>
        )}
        <div aria-live="polite">
          {d.fb && !d.done && (
            <div key={d.idx + ':' + d.mistakes} className={'feedback drill-fb ' + (d.fb.ok ? 'ok' : 'no')}>
              {d.fb.ok ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />} <strong>{d.fb.ok ? tx('Doğru. ', 'Right. ') : tx('Olmadı. ', 'Not quite. ')}</strong>
              {d.fb.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DrillProps {
  seed: number
  onNew: () => void
}

/** Remount on restart so the step machine resets with the same input. */
function Restartable({ render }: { render: (restart: () => void) => ReactNode }) {
  const [run, setRun] = useState(0)
  return <div key={run}>{render(() => setRun((r) => r + 1))}</div>
}

function InsertionDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

function MergeDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

function PartitionDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

function MomDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

function RadixDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

function BstDrillView({ seed, onNew, onRestart }: DrillProps & { onRestart: () => void }) {
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

const VIEWS: Record<DrillId, (p: DrillProps & { onRestart: () => void }) => ReactNode> = {
  insertion: InsertionDrillView,
  merge: MergeDrillView,
  partition: PartitionDrillView,
  'select-mom': MomDrillView,
  radix: RadixDrillView,
  bst: BstDrillView,
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

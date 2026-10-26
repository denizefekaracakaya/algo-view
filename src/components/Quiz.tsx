import { useId, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, Lightbulb, XCircle, Eye } from 'lucide-react'
import type { MCQ, NumericQ, OrderQ, Practice, Question } from '../content/types'
import { useProgress } from '../state/ProgressContext'
import { Inline, Rich } from './Tex'
import { tx } from '../i18n/lang'

export interface CheckResult {
  correct: boolean
  /** Correct on the very first attempt. */
  firstTry: boolean
  attempts: number
}

/**
 * Ungraded “try it yourself” questions placed inside the lesson text. Results live only in
 * the page (they are not saved), and feed the per-section summary at the end of the lesson.
 */
export function CheckBlock({
  lessonId,
  questions,
  offset,
  total,
  results,
  onResult,
}: {
  lessonId: string
  questions: Question[]
  offset: number
  total: number
  results: Record<string, CheckResult>
  onResult: (qid: string, correct: boolean) => void
}) {
  return (
    <aside className="check-block" aria-label={tx('Kendini dene', 'Try it yourself')}>
      <div className="check-head">
        <span className="check-icon" aria-hidden>
          ?
        </span>
        <strong>{tx('KENDİNİ DENE', 'TRY IT YOURSELF')}</strong>
        <span className="badge">{tx('Puanlanmaz', 'Not graded')}</span>
      </div>
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          n={offset + i + 1}
          total={total}
          storeKey={`${lessonId}:check:${q.id}`}
          solved={results[q.id]?.correct}
          onRecord={(c) => onResult(q.id, c)}
        />
      ))}
    </aside>
  )
}

export function Quiz({ lessonId, questions }: { lessonId: string; questions: Question[] }) {
  const { progress } = useProgress()
  const solved = questions.filter((q) => progress.quiz[`${lessonId}:${q.id}`]?.correct).length
  return (
    <div>
      <p className="small muted" aria-live="polite">
        {tx(`${solved} / ${questions.length} soru doğru cevaplandı.`, `${solved} / ${questions.length} questions answered correctly.`)}
      </p>
      {questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} n={i + 1} storeKey={`${lessonId}:${q.id}`} />
      ))}
    </div>
  )
}

interface CardProps {
  q: Question
  n: number
  storeKey: string
  /** Ungraded mode: report results to the caller instead of the persisted quiz record. */
  onRecord?: (correct: boolean) => void
  solved?: boolean
  total?: number
}

export function QuestionCard({ q, n, storeKey, onRecord, solved, total }: CardProps) {
  const { progress, dispatch } = useProgress()
  const rec = progress.quiz[storeKey]
  const [showHint, setShowHint] = useState(false)
  const [reveal, setReveal] = useState(false)
  const record = onRecord ?? ((correct: boolean) => dispatch({ type: 'quiz', key: storeKey, correct }))
  const isSolved = onRecord ? solved : rec?.correct
  return (
    <article className="quiz-q" aria-labelledby={`q-${storeKey}`}>
      <div className="q-head">
        <h3 id={`q-${storeKey}`} style={{ fontSize: '0.98rem', margin: 0 }}>
          <span className="muted mono">
            {total ? `${tx('SORU', 'QUESTION')} ${n} / ${total}` : `${tx('S', 'Q')}${n}.`}
          </span>{' '}
          <Inline src={q.prompt} />
        </h3>
        {isSolved && (
          <span className="badge done">
            <CheckCircle2 size={12} aria-hidden /> {tx('çözüldü', 'solved')}
          </span>
        )}
      </div>
      {q.kind === 'mcq' && <McqBody q={q} onAnswer={record} />}
      {q.kind === 'numeric' && <NumericBody q={q} onAnswer={record} />}
      {q.kind === 'order' && <OrderBody q={q} onAnswer={record} />}
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn sm ghost" onClick={() => setShowHint((s) => !s)} aria-expanded={showHint}>
          <Lightbulb size={14} aria-hidden /> {tx('İpucu', 'Hint')}
        </button>
        <button className="btn sm ghost" onClick={() => setReveal((s) => !s)} aria-expanded={reveal}>
          <Eye size={14} aria-hidden /> {tx('Çözümü göster', 'Show solution')}
        </button>
      </div>
      {showHint && (
        <div className="feedback hint">
          <Inline src={q.hint} />
        </div>
      )}
      {reveal && (
        <div className="feedback ok">
          <strong>{tx('Çözüm: ', 'Solution: ')}</strong>
          {q.kind === 'mcq' && <Inline src={q.options[q.answer] + '. '} />}
          {q.kind === 'numeric' && <span className="mono">{q.answer}. </span>}
          {q.kind === 'order' && <span>{q.items.join(' → ')}. </span>}
          <Inline src={q.explanation} />
        </div>
      )}
    </article>
  )
}

function McqBody({ q, onAnswer }: { q: MCQ; onAnswer: (c: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState<number | null>(null)
  const name = useId()
  const correct = checked !== null && checked === q.answer
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (choice === null) return
        setChecked(choice)
        onAnswer(choice === q.answer)
      }}
    >
      <fieldset>
        <legend className="sr-only">{tx('Seçenekler', 'Options')}</legend>
        {q.options.map((o, i) => (
          <label key={i} className={'option' + (checked !== null && i === checked ? (correct ? ' correct' : ' wrong') : '')}>
            <input type="radio" name={name} checked={choice === i} onChange={() => setChoice(i)} />
            <span>
              <Inline src={o} />
            </span>
          </label>
        ))}
      </fieldset>
      <button className="btn sm primary" type="submit" disabled={choice === null}>
        {tx('Kontrol et', 'Check')}
      </button>
      {checked !== null && (
        <div className={'feedback ' + (correct ? 'ok' : 'no')} role="status">
          {correct ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />} <strong>{correct ? tx('Doğru!', 'Correct!') : tx('Yanlış.', 'Incorrect.')}</strong>{' '}
          {correct ? <Inline src={q.explanation} /> : <Inline src={q.feedback?.[checked] ?? tx('Tekrar deneyin; gerekirse ipucuna bakın.', 'Try again; look at the hint if needed.')} />}
        </div>
      )}
    </form>
  )
}

function NumericBody({ q, onAnswer }: { q: NumericQ; onAnswer: (c: boolean) => void }) {
  const [val, setVal] = useState('')
  const [res, setRes] = useState<null | boolean>(null)
  const [err, setErr] = useState<string | null>(null)
  return (
    <form
      className="row"
      style={{ margin: '8px 0' }}
      onSubmit={(e) => {
        e.preventDefault()
        // accept “4 995 000”, a decimal comma and the typographic minus
        const v = Number(val.replace(/[\s_]/g, '').replace(',', '.').replace('−', '-'))
        if (val.trim() === '' || !Number.isFinite(v)) {
          setErr(tx('Lütfen bir sayı girin.', 'Please enter a number.'))
          return
        }
        setErr(null)
        const ok = Math.abs(v - q.answer) <= (q.tolerance ?? 1e-9)
        setRes(ok)
        onAnswer(ok)
      }}
    >
      <input className="input mono" style={{ width: 140 }} inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label={tx('Cevabınız', 'Your answer')} aria-invalid={!!err} />
      <button className="btn sm primary" type="submit">
        {tx('Kontrol et', 'Check')}
      </button>
      {err && <span className="error-msg">{err}</span>}
      {res !== null && (
        <div className={'feedback ' + (res ? 'ok' : 'no')} role="status" style={{ flexBasis: '100%' }}>
          <strong>{res ? tx('Doğru!', 'Correct!') : tx('Yanlış.', 'Incorrect.')}</strong> {res ? <Inline src={q.explanation} /> : tx('Tekrar deneyin; gerekirse ipucuna bakın.', 'Try again; look at the hint if needed.')}
        </div>
      )}
    </form>
  )
}

/** Deterministic shuffle so the initial order is stable across renders and never already solved. */
function shuffled(items: string[]): string[] {
  const idx = items.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  if (idx.every((v, i) => v === i) && idx.length > 1) idx.reverse()
  return idx.map((i) => items[i])
}

function OrderBody({ q, onAnswer }: { q: OrderQ; onAnswer: (c: boolean) => void }) {
  const [list, setList] = useState(() => shuffled(q.items))
  const [res, setRes] = useState<null | boolean>(null)
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    setList(next)
    setRes(null)
  }
  return (
    <div>
      <ol className="order-list" aria-label={tx('Sıralanacak adımlar', 'Steps to order')}>
        {list.map((item, i) => (
          <li key={item}>
            <span className="mono muted">{i + 1}.</span>
            <span className="grow">
              <Inline src={item} />
            </span>
            <button className="btn icon sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={tx(`"${item}" yukarı taşı`, `Move "${item}" up`)}>
              <ArrowUp size={14} aria-hidden />
            </button>
            <button className="btn icon sm" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={tx(`"${item}" aşağı taşı`, `Move "${item}" down`)}>
              <ArrowDown size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <button
        className="btn sm primary"
        onClick={() => {
          const ok = list.every((x, i) => x === q.items[i])
          setRes(ok)
          onAnswer(ok)
        }}
      >
        {tx('Sıralamayı kontrol et', 'Check order')}
      </button>
      {res !== null && (
        <div className={'feedback ' + (res ? 'ok' : 'no')} role="status">
          <strong>{res ? tx('Doğru!', 'Correct!') : tx('Henüz değil.', 'Not yet.')}</strong>{' '}
          {res ? <Inline src={q.explanation} /> : tx(`${list.filter((x, i) => x === q.items[i]).length} / ${list.length} adım doğru yerde.`, `${list.filter((x, i) => x === q.items[i]).length} / ${list.length} steps in the right place.`)}
        </div>
      )}
    </div>
  )
}

export function PracticeList({ items }: { items: Practice[] }) {
  return (
    <div>
      {items.map((p, i) => (
        <PracticeCard key={p.id} p={p} n={i + 1} />
      ))}
    </div>
  )
}

function PracticeCard({ p, n }: { p: Practice; n: number }) {
  const [hints, setHints] = useState(0)
  const [sol, setSol] = useState(false)
  return (
    <article className="quiz-q">
      <h3 style={{ fontSize: '0.98rem' }}>
        <span className="muted mono">{tx('A', 'P')}{n}.</span> {tx('Alıştırma', 'Practice')}
      </h3>
      <Rich text={p.prompt} />
      {p.hints.slice(0, hints).map((h, i) => (
        <div key={i} className="feedback hint">
          <strong>{tx('İpucu', 'Hint')} {i + 1}: </strong>
          <Inline src={h} />
        </div>
      ))}
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn sm" onClick={() => setHints((h) => h + 1)} disabled={hints >= p.hints.length}>
          <Lightbulb size={14} aria-hidden /> {hints >= p.hints.length ? tx('Tüm ipuçları açıldı', 'All hints shown') : `${tx('İpucu', 'Hint')} (${hints}/${p.hints.length})`}
        </button>
        <button className="btn sm ghost" onClick={() => setSol((s) => !s)} aria-expanded={sol}>
          <Eye size={14} aria-hidden /> {sol ? tx('Çözümü gizle', 'Hide solution') : tx('Çözümü göster', 'Show solution')}
        </button>
      </div>
      {sol && (
        <div className="feedback ok">
          <Rich text={p.solution} />
        </div>
      )}
    </article>
  )
}

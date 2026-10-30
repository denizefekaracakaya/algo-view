import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle2, Clock, Flag, Play, RotateCcw, XCircle } from 'lucide-react'
import { lectures } from '../content/curriculum'
import type { Question } from '../content/types'
import { Inline } from '../components/Tex'
import { useProgress } from '../state/ProgressContext'
import { locale, tx } from '../i18n/lang'
import { buildExam, grade, initialOrder, isAnswered, scoreByLesson, type ExamAnswer, type ExamItem } from './exam'

const COUNTS = [5, 10, 20]
const LIMITS = [0, 10, 20, 30]

interface Config {
  lessons: string[]
  count: number
  minutes: number
}

type Phase = { kind: 'setup' } | { kind: 'run'; items: ExamItem[]; startedAt: number; config: Config } | { kind: 'done'; items: ExamItem[]; answers: Record<string, ExamAnswer>; seconds: number; config: Config }

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

export function ExamPanel({ lessonId }: { lessonId: string | null }) {
  const allIds = lectures().flatMap((l) => l.lessons.map((x) => x.id))
  const [config, setConfig] = useState<Config>({ lessons: lessonId ? [lessonId] : allIds, count: 10, minutes: 20 })
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' })
  const start = (c: Config) => {
    const items = buildExam(c.lessons, c.count, 1 + Math.floor(Math.random() * 1e9))
    setPhase({ kind: 'run', items, startedAt: Date.now(), config: c })
  }
  if (phase.kind === 'run')
    return <ExamRun key={phase.startedAt} items={phase.items} startedAt={phase.startedAt} minutes={phase.config.minutes} onFinish={(answers, seconds) => setPhase({ kind: 'done', items: phase.items, answers, seconds, config: phase.config })} />
  if (phase.kind === 'done') return <ExamResult {...phase} onAgain={() => start(phase.config)} onSetup={() => setPhase({ kind: 'setup' })} />
  return <ExamSetup config={config} setConfig={setConfig} onStart={() => start(config)} />
}

function ExamSetup({ config, setConfig, onStart }: { config: Config; setConfig: (c: Config) => void; onStart: () => void }) {
  const { progress } = useProgress()
  const toggle = (id: string) => setConfig({ ...config, lessons: config.lessons.includes(id) ? config.lessons.filter((x) => x !== id) : [...config.lessons, id] })
  const LECS = lectures()
  return (
    <div className="exam-setup">
      <div className="card card-pad stack">
        <h2 style={{ margin: 0 }}>{tx('Sınav ayarları', 'Exam settings')}</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {tx(
            'Sorular derslerin quiz ve “kendini dene” sorularından ve her seferinde yeniden üretilen sorulardan karışık seçilir. Sınav boyunca geri bildirim verilmez; sonuçlar sonunda gösterilir.',
            'Questions are mixed from the lessons’ quiz and try-it-yourself questions and freshly generated ones. There is no feedback during the exam; results are shown at the end.',
          )}
        </p>
        <fieldset className="exam-lessons">
          <legend className="small">
            <strong>{tx('Dersler', 'Lessons')}</strong>{' '}
            <button type="button" className="btn sm ghost" onClick={() => setConfig({ ...config, lessons: LECS.flatMap((l) => l.lessons.map((x) => x.id)) })}>
              {tx('Tümü', 'All')}
            </button>
            <button type="button" className="btn sm ghost" onClick={() => setConfig({ ...config, lessons: [] })}>
              {tx('Hiçbiri', 'None')}
            </button>
          </legend>
          {LECS.map((lec) => (
            <div key={lec.n} className="exam-lec">
              <span className="lecture-num">
                {tx('Ders', 'Lecture')} {lec.n}
              </span>
              {lec.lessons.map((l) => (
                <label key={l.id} className="exam-check">
                  <input type="checkbox" checked={config.lessons.includes(l.id)} onChange={() => toggle(l.id)} />
                  <Inline src={l.title} />
                </label>
              ))}
            </div>
          ))}
        </fieldset>
        <div className="row" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 6 }}>
            <span className="small muted">{tx('Soru sayısı', 'Questions')}</span>
            <div className="seg" role="group" aria-label={tx('Soru sayısı', 'Number of questions')}>
              {COUNTS.map((c) => (
                <button key={c} aria-pressed={config.count === c} onClick={() => setConfig({ ...config, count: c })}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="small muted">{tx('Süre', 'Time limit')}</span>
            <div className="seg" role="group" aria-label={tx('Süre sınırı', 'Time limit')}>
              {LIMITS.map((m) => (
                <button key={m} aria-pressed={config.minutes === m} onClick={() => setConfig({ ...config, minutes: m })}>
                  {m === 0 ? tx('Yok', 'None') : `${m} ${tx('dk', 'min')}`}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <button className="btn primary" disabled={!config.lessons.length} onClick={onStart}>
            <Play size={16} aria-hidden /> {tx('Sınavı başlat', 'Start the exam')}
          </button>
          {!config.lessons.length && <span className="small error-msg"> {tx('En az bir ders seçin.', 'Choose at least one lesson.')}</span>}
        </div>
      </div>
      <div className="card card-pad stack">
        <h2 style={{ margin: 0, fontSize: '1rem' }}>{tx('Geçmiş sınavlar', 'Past exams')}</h2>
        {progress.exams.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>
            {tx('Henüz sınav yok.', 'No exams yet.')}
          </p>
        ) : (
          <ol className="exam-history">
            {progress.exams.map((e) => (
              <li key={e.at}>
                <span className="small muted">{new Date(e.at).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span className="mono">
                  {e.correct}/{e.total}
                </span>
                <span className={'badge ' + (e.correct / e.total >= 0.7 ? 'done' : 'progress')}>{Math.round((e.correct / e.total) * 100)}%</span>
                <span className="small muted mono">{mmss(e.seconds)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function ExamRun({ items, startedAt, minutes, onFinish }: { items: ExamItem[]; startedAt: number; minutes: number; onFinish: (a: Record<string, ExamAnswer>, seconds: number) => void }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({})
  const [now, setNow] = useState(() => Date.now())
  const [confirm, setConfirm] = useState(false)
  const elapsed = Math.floor((now - startedAt) / 1000)
  const limit = minutes * 60
  const left = limit ? Math.max(0, limit - elapsed) : null
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (left === 0) onFinish(answers, limit)
  }, [left, answers, limit, onFinish])
  const it = items[idx]
  const answered = items.filter((x) => isAnswered(answers[x.key] ?? null)).length
  const set = (a: ExamAnswer) => setAnswers((s) => ({ ...s, [it.key]: a }))
  const finish = () => onFinish(answers, Math.min(elapsed, limit || elapsed))
  return (
    <div className="exam-run">
      <div className="card exam-bar">
        <span className={'mono exam-timer' + (left !== null && left < 60 ? ' low' : '')} role="timer" aria-label={tx('Süre', 'Time')}>
          <Clock size={15} aria-hidden /> {left !== null ? mmss(left) : mmss(elapsed)}
        </span>
        <span className="small muted">
          {tx(`${answered} / ${items.length} cevaplandı`, `${answered} / ${items.length} answered`)}
        </span>
        <span className="spacer" />
        <button className="btn sm primary" onClick={() => (answered < items.length ? setConfirm(true) : finish())}>
          <Flag size={14} aria-hidden /> {tx('Sınavı bitir', 'Finish exam')}
        </button>
      </div>
      {confirm && (
        <div className="feedback hint row" role="alert">
          <span className="grow">{tx(`${items.length - answered} soru boş. Yine de bitirilsin mi?`, `${items.length - answered} questions are unanswered. Finish anyway?`)}</span>
          <button className="btn sm" onClick={() => setConfirm(false)}>
            {tx('Devam et', 'Keep going')}
          </button>
          <button className="btn sm primary" onClick={finish}>
            {tx('Bitir', 'Finish')}
          </button>
        </div>
      )}
      <nav className="exam-dots" aria-label={tx('Sorular', 'Questions')}>
        {items.map((x, i) => (
          <button key={x.key} className={(isAnswered(answers[x.key] ?? null) ? 'answered' : '') + (i === idx ? ' current' : '')} aria-current={i === idx ? 'step' : undefined} onClick={() => setIdx(i)} aria-label={tx(`Soru ${i + 1}`, `Question ${i + 1}`)}>
            {i + 1}
          </button>
        ))}
      </nav>
      <article className="card card-pad quiz-q exam-q" aria-labelledby="exam-q-h">
        <h3 id="exam-q-h" style={{ fontSize: '1rem', margin: '0 0 8px' }}>
          <span className="muted mono small exam-qnum">
            {tx('SORU', 'QUESTION')} {idx + 1} / {items.length}
          </span>
          <Inline src={it.q.prompt} />
        </h3>
        <AnswerInput key={it.key} q={it.q} seed={idx + 1} value={answers[it.key] ?? null} onChange={set} />
      </article>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          <ArrowLeft size={16} aria-hidden /> {tx('Önceki', 'Previous')}
        </button>
        <button className="btn" disabled={idx === items.length - 1} onClick={() => setIdx(idx + 1)}>
          {tx('Sonraki', 'Next')} <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}

function AnswerInput({ q, seed, value, onChange }: { q: Question; seed: number; value: ExamAnswer; onChange: (a: ExamAnswer) => void }) {
  const order = useMemo(() => (q.kind === 'order' ? (Array.isArray(value) ? value : initialOrder(q.items, seed)) : []), [q, seed, value])
  if (q.kind === 'mcq')
    return (
      <fieldset>
        <legend className="sr-only">{tx('Seçenekler', 'Options')}</legend>
        {q.options.map((o, i) => (
          <label key={i} className="option">
            <input type="radio" name={'exam-' + q.id} checked={value === i} onChange={() => onChange(i)} />
            <span>
              <Inline src={o} />
            </span>
          </label>
        ))}
      </fieldset>
    )
  if (q.kind === 'numeric')
    return (
      <input
        className="input mono"
        style={{ width: 160 }}
        inputMode="decimal"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={tx('Cevabınız', 'Your answer')}
        placeholder={tx('Sayı girin', 'Enter a number')}
      />
    )
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <ol className="order-list" aria-label={tx('Sıralanacak adımlar', 'Steps to order')}>
      {order.map((item, i) => (
        <li key={item}>
          <span className="mono muted">{i + 1}.</span>
          <span className="grow">
            <Inline src={item} />
          </span>
          <button className="btn icon sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={tx('Yukarı taşı', 'Move up')}>
            <ArrowUp size={14} aria-hidden />
          </button>
          <button className="btn icon sm" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={tx('Aşağı taşı', 'Move down')}>
            <ArrowDown size={14} aria-hidden />
          </button>
        </li>
      ))}
    </ol>
  )
}

function showAnswer(q: Question, a: ExamAnswer): string {
  if (a === null || (typeof a === 'string' && !a.trim())) return tx('(boş)', '(blank)')
  if (q.kind === 'mcq') return typeof a === 'number' ? q.options[a] : '?'
  if (q.kind === 'numeric') return String(a)
  return Array.isArray(a) ? a.join(' → ') : '?'
}

function correctAnswer(q: Question): string {
  if (q.kind === 'mcq') return q.options[q.answer]
  if (q.kind === 'numeric') return String(q.answer)
  return q.items.join(' → ')
}

function ExamResult({ items, answers, seconds, config, onAgain, onSetup }: { items: ExamItem[]; answers: Record<string, ExamAnswer>; seconds: number; config: Config; onAgain: () => void; onSetup: () => void }) {
  const { dispatch } = useProgress()
  const correct = items.filter((it) => grade(it.q, answers[it.key] ?? null)).length
  const pct = Math.round((correct / Math.max(1, items.length)) * 100)
  const byLesson = scoreByLesson(items, answers)
  const titles = new Map(lectures().flatMap((l) => l.lessons.map((x) => [x.id, x.title] as const)))
  // Save once per finished exam (the ref also guards StrictMode's double effect run).
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    dispatch({ type: 'exam', record: { at: Date.now(), total: items.length, correct, seconds, lessons: config.lessons } })
  }, [dispatch, items.length, correct, seconds, config.lessons])
  return (
    <div className="stack">
      <section className="card card-pad exam-score" aria-labelledby="exam-score-h">
        <div>
          <h2 id="exam-score-h" style={{ margin: 0 }}>
            {tx('Sonuç', 'Result')}: {correct} / {items.length}
          </h2>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            {tx(`Süre ${mmss(seconds)}`, `Time ${mmss(seconds)}`)} ·{' '}
            {pct >= 85 ? tx('Harika iş!', 'Great work!') : pct >= 60 ? tx('İyi gidiyor; yanlışları gözden geçir.', 'Going well; review the mistakes.') : tx('Zayıf görünen dersleri tekrar et.', 'Revisit the lessons that look weak.')}
          </p>
        </div>
        <span className={'exam-pct mono ' + (pct >= 70 ? 'ok-text' : '')}>{pct}%</span>
        <div className="row">
          <button className="btn primary" onClick={onAgain}>
            <RotateCcw size={15} aria-hidden /> {tx('Aynı ayarlarla yeni sınav', 'New exam, same settings')}
          </button>
          <button className="btn" onClick={onSetup}>
            {tx('Ayarlar', 'Settings')}
          </button>
        </div>
      </section>
      <section className="card card-pad" aria-labelledby="exam-by-lesson">
        <h3 id="exam-by-lesson" style={{ marginTop: 0 }}>
          {tx('Derslere göre', 'By lesson')}
        </h3>
        <ul className="exam-bars">
          {byLesson.map((s) => (
            <li key={s.lessonId}>
              <Link to={`/ders/${s.lessonId}`} className="small">
                <Inline src={titles.get(s.lessonId) ?? s.lessonId} />
              </Link>
              <span className="exam-bar-track" aria-hidden>
                <span style={{ width: `${(s.correct / s.total) * 100}%` }} />
              </span>
              <span className="mono small">
                {s.correct}/{s.total}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={tx('Soruların çözümleri', 'Solutions')} className="stack">
        {items.map((it, i) => {
          const a = answers[it.key] ?? null
          const ok = grade(it.q, a)
          return (
            <details key={it.key} className={'card card-pad exam-review ' + (ok ? 'ok' : 'no')} open={!ok}>
              <summary>
                {ok ? <CheckCircle2 size={16} color="var(--st-sorted)" aria-label={tx('doğru', 'correct')} /> : <XCircle size={16} color="var(--st-bad)" aria-label={tx('yanlış', 'wrong')} />}{' '}
                <span className="mono muted">{i + 1}.</span> <Inline src={it.q.prompt} />
              </summary>
              <p className="small" style={{ margin: '8px 0 4px' }}>
                <strong>{tx('Cevabın', 'Your answer')}:</strong> <Inline src={showAnswer(it.q, a)} />
              </p>
              {!ok && (
                <p className="small" style={{ margin: '0 0 4px' }}>
                  <strong>{tx('Doğru cevap', 'Correct answer')}:</strong> <Inline src={correctAnswer(it.q)} />
                </p>
              )}
              <div className="feedback ok small">
                <Inline src={it.q.explanation} />
              </div>
            </details>
          )
        })}
      </section>
    </div>
  )
}

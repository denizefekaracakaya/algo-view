import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Dices, Flame, Hand, Shuffle } from 'lucide-react'
import { allLessons } from '../content/curriculum'
import { QuestionCard } from '../components/Quiz'
import { Inline } from '../components/Tex'
import { useProgress } from '../state/ProgressContext'
import { tx } from '../i18n/lang'
import { GENERATORS, generate, generatorsFor } from '../practice/generators'
import { DRILL_LESSON, DRILLS, type DrillId } from '../practice/drills'
import { DrillRunner } from '../practice/HandTrace'

type Mode = 'trace' | 'bank'

/** Lessons that have at least one drill or generator, in course order. */
function practiceLessons() {
  const ids = new Set([...GENERATORS.map((g) => g.lessonId), ...Object.values(DRILL_LESSON)])
  return allLessons().filter((l) => ids.has(l.id))
}

export function PracticePage() {
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('mod') === 'soru' ? 'bank' : 'trace'
  const lessons = practiceLessons()
  const lessonId = lessons.some((l) => l.id === params.get('ders')) ? params.get('ders') : null
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }
  const lesson = lessons.find((l) => l.id === lessonId)

  return (
    <div className="practice">
      <header className="lesson-head">
        <p className="lecture-num">{tx('Alıştırma laboratuvarı', 'Practice lab')}</p>
        <h1>{tx('Elle iz sür, sınırsız soru çöz', 'Trace by hand, solve endless questions')}</h1>
        <p className="lead" style={{ maxWidth: '70ch', color: 'var(--text-2)' }}>
          {tx(
            'Elle iz sürmede algoritmanın her kararını sen verirsin; yanlış seçimde ipucu alırsın. Soru üreteci her seferinde yeni bir girdi oluşturur ve cevabı algoritma motorlarıyla hesaplar.',
            'In hand tracing you make every decision of the algorithm yourself and get a hint after a wrong choice. The question generator builds a fresh input every time and computes the answer with the algorithm engines.',
          )}
        </p>
      </header>

      <div className="filterbar">
        <div className="seg" role="tablist" aria-label={tx('Alıştırma türü', 'Practice type')}>
          <button role="tab" aria-selected={mode === 'trace'} onClick={() => set({ mod: null })}>
            <Hand size={14} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Elle iz sür', 'Trace by hand')}
          </button>
          <button role="tab" aria-selected={mode === 'bank'} onClick={() => set({ mod: 'soru' })}>
            <Dices size={14} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Soru üreteci', 'Question generator')}
          </button>
        </div>
        <label className="row" style={{ gap: 6 }}>
          <span className="small muted">{tx('Ders', 'Lesson')}</span>
          <select className="input" value={lessonId ?? ''} onChange={(e) => set({ ders: e.target.value || null })}>
            <option value="">{tx('Tüm dersler', 'All lessons')}</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {tx('Ders', 'Lecture')} {l.lecture} · {l.title.replace(/\$/g, '')}
              </option>
            ))}
          </select>
        </label>
        {lesson && (
          <Link className="small" to={`/ders/${lesson.id}`}>
            {tx('Derse dön', 'Back to the lesson')} →
          </Link>
        )}
      </div>

      {mode === 'trace' ? <TracePanel key={lessonId ?? 'all'} lessonId={lessonId} /> : <BankPanel key={lessonId ?? 'all'} lessonId={lessonId} />}
    </div>
  )
}

function TracePanel({ lessonId }: { lessonId: string | null }) {
  const { progress } = useProgress()
  const drills = DRILLS.filter((d) => !lessonId || DRILL_LESSON[d.id] === lessonId)
  const [active, setActive] = useState<DrillId | null>(drills[0]?.id ?? null)
  if (!drills.length)
    return (
      <p className="muted">
        {tx('Bu ders için henüz elle iz sürme alıştırması yok; soru üretecini deneyin.', 'There is no hand-tracing drill for this lesson yet; try the question generator.')}
      </p>
    )
  return (
    <div className="stack">
      <div className="drill-picker" role="group" aria-label={tx('Alıştırma seç', 'Choose a drill')}>
        {drills.map((d) => {
          const st = progress.drills[d.id]
          return (
            <button key={d.id} className="drill-card" aria-pressed={active === d.id} onClick={() => setActive(d.id)}>
              <strong>{d.title()}</strong>
              <span className="small">{d.blurb()}</span>
              <span className="small muted">
                {st ? tx(`${st.runs} kez tamamlandı · ${st.perfect} hatasız`, `completed ${st.runs}× · ${st.perfect} perfect`) : tx('Henüz denenmedi', 'Not tried yet')}
              </span>
            </button>
          )
        })}
      </div>
      {active && <DrillRunner key={active} id={active} />}
    </div>
  )
}

const newSeed = () => 1 + Math.floor(Math.random() * 1e9)

function BankPanel({ lessonId }: { lessonId: string | null }) {
  const { progress, dispatch } = useProgress()
  const gens = generatorsFor(lessonId)
  const [enabled, setEnabled] = useState<string[]>(() => gens.map((g) => g.id))
  const [current, setCurrent] = useState(() => ({ gen: gens[Math.floor(Math.random() * gens.length)]?.id ?? '', seed: newSeed() }))
  const [count, setCount] = useState(1)
  const [solved, setSolved] = useState<string[]>([])
  const [tried, setTried] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const gen = gens.find((g) => g.id === current.gen) ?? gens[0]
  const q = useMemo(() => (gen ? generate(gen, current.seed) : null), [gen, current.seed])
  if (!gen || !q) return <p className="muted">{tx('Bu ders için soru üreteci yok.', 'There is no question generator for this lesson.')}</p>

  const next = () => {
    const pool = gens.filter((g) => enabled.includes(g.id))
    const choices = pool.length > 1 ? pool.filter((g) => g.id !== gen.id) : pool
    const g = choices[Math.floor(Math.random() * choices.length)] ?? gen
    setCurrent({ gen: g.id, seed: newSeed() })
    setCount((c) => c + 1)
  }
  const toggle = (id: string) => setEnabled((xs) => (xs.includes(id) ? (xs.length > 1 ? xs.filter((x) => x !== id) : xs) : [...xs, id]))
  const record = (correct: boolean) => {
    const first = !tried.includes(q.id)
    if (first) setTried((xs) => [...xs, q.id])
    if (correct && !solved.includes(q.id)) {
      setSolved((xs) => [...xs, q.id])
      setStreak((s) => (first ? s + 1 : 0))
      dispatch({ type: 'gen', id: gen.id, solved: true })
    } else if (!correct) {
      if (first) setStreak(0)
      dispatch({ type: 'gen', id: gen.id, solved: false })
    }
  }
  const total = Object.values(progress.gen).reduce((s, g) => s + g.solved, 0)

  return (
    <div className="bank">
      <aside className="card card-pad bank-side">
        <strong className="small">{tx('Soru türleri', 'Question types')}</strong>
        <ul className="bank-types">
          {gens.map((g) => (
            <li key={g.id}>
              <label>
                <input type="checkbox" checked={enabled.includes(g.id)} onChange={() => toggle(g.id)} />
                <span>{g.title()}</span>
                <span className="mono small muted">{progress.gen[g.id]?.solved ?? 0}</span>
              </label>
            </li>
          ))}
        </ul>
        <dl className="kv" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div>
            <dt>{tx('oturum', 'session')}</dt>
            <dd>
              {solved.length}/{count}
            </dd>
          </div>
          <div>
            <dt>
              <Flame size={11} aria-hidden /> {tx('seri', 'streak')}
            </dt>
            <dd>{streak}</dd>
          </div>
          <div>
            <dt>{tx('toplam', 'all time')}</dt>
            <dd>{total}</dd>
          </div>
        </dl>
        <p className="small muted" style={{ margin: 0 }}>
          {tx('Seri yalnızca ilk denemede doğru çözülen sorularla artar.', 'The streak only grows with questions solved on the first try.')}
        </p>
      </aside>
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="badge accent">
            <Inline src={gen.title()} />
          </span>
          <button className="btn primary" onClick={next}>
            <Shuffle size={16} aria-hidden /> {tx('Yeni soru', 'New question')}
          </button>
        </div>
        <QuestionCard key={q.id} q={q} n={count} storeKey={`gen:${q.id}`} onRecord={record} solved={solved.includes(q.id)} />
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, CircleDot, Search } from 'lucide-react'
import { ALL_LESSONS, LECTURES, findLesson } from '../content/curriculum'
import { useProgress } from '../state/ProgressContext'
import { lessonStatus, type LessonStatus } from '../state/progress'
import { Inline } from '../components/Tex'

export function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'completed') return <CheckCircle2 size={16} color="var(--st-sorted)" aria-label="tamamlandı" />
  if (status === 'in-progress') return <CircleDot size={16} color="var(--st-compare)" aria-label="devam ediyor" />
  return <Circle size={16} color="var(--muted)" aria-label="başlanmadı" />
}

const STATUS_TEXT: Record<LessonStatus, string> = { completed: 'Tamamlandı', 'in-progress': 'Devam ediyor', 'not-started': 'Başlanmadı' }

type Filter = 'all' | LessonStatus

export function Dashboard() {
  const { progress } = useProgress()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const done = ALL_LESSONS.filter((l) => lessonStatus(progress, l.id) === 'completed').length
  const pct = Math.round((done / ALL_LESSONS.length) * 100)
  const solved = Object.values(progress.quiz).filter((q) => q.correct).length
  const totalQ = ALL_LESSONS.reduce((s, l) => s + l.quiz.length, 0)
  const continueTarget = useMemo(() => {
    if (progress.lastLesson && findLesson(progress.lastLesson) && lessonStatus(progress, progress.lastLesson) !== 'completed') return findLesson(progress.lastLesson)!.lesson
    return ALL_LESSONS.find((l) => lessonStatus(progress, l.id) !== 'completed') ?? ALL_LESSONS[0]
  }, [progress])

  const q = query.trim().toLocaleLowerCase('tr')
  const matches = (text: string) => text.toLocaleLowerCase('tr').includes(q)

  return (
    <div>
      <section className="hero">
        <div>
          <p className="lecture-num">CS161 · Ders 1–7 · Türkçe</p>
          <h1>Algoritmaları görünür kıl.</h1>
          <p className="lead">
            Algo View; algoritmaları adım adım çalıştırmanız, her adımın <em>neden</em> olduğunu görmeniz, kendi girdilerinizle deney yapmanız ve karmaşıklık analizini
            somut çalışmalara bağlamanız için tasarlanmış etkileşimli bir öğrenme ortamıdır.
          </p>
          <div className="row">
            <Link className="btn primary" to={`/ders/${continueTarget.id}`}>
              {done === 0 && !progress.lastLesson ? 'Öğrenmeye başla' : 'Kaldığın yerden devam et'} <ArrowRight size={16} aria-hidden />
            </Link>
            <span className="small muted">
              Sıradaki: Ders {continueTarget.lecture} · {continueTarget.title}
            </span>
          </div>
        </div>
        <div className="card card-pad stack" aria-label="İlerleme özeti">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>İlerlemen</strong>
            <span className="mono">{pct}%</span>
          </div>
          <div className="progressbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tamamlanan dersler">
            <span style={{ width: `${pct}%` }} />
          </div>
          <dl className="kv" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <dt>ders</dt>
              <dd>
                {done}/{ALL_LESSONS.length}
              </dd>
            </div>
            <div>
              <dt>soru</dt>
              <dd>
                {solved}/{totalQ}
              </dd>
            </div>
            <div>
              <dt>konu</dt>
              <dd>{LECTURES.length}</dd>
            </div>
          </dl>
          <p className="small muted" style={{ margin: 0 }}>
            İlerleme yalnızca bu tarayıcıda saklanır. Ayarlar sayfasından sıfırlayabilirsiniz.
          </p>
        </div>
      </section>

      <div className="filterbar" role="search">
        <label className="row" style={{ flex: '1 1 260px', gap: 6 }}>
          <Search size={16} aria-hidden className="muted" />
          <span className="sr-only">Konu ara</span>
          <input className="input grow" placeholder="Konu ara: ör. Master, pivot, kırmızı-siyah…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="seg" role="group" aria-label="Duruma göre filtrele">
          {(['all', 'not-started', 'in-progress', 'completed'] as Filter[]).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tümü' : STATUS_TEXT[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="lecture-grid">
        {LECTURES.map((lec) => {
          const lessons = lec.lessons.filter(
            (l) =>
              (filter === 'all' || lessonStatus(progress, l.id) === filter) &&
              (!q || matches(l.title) || matches(l.titleEn) || matches(l.summary) || matches(lec.title) || matches(lec.titleEn)),
          )
          if (!lessons.length) return null
          const lecDone = lec.lessons.filter((l) => lessonStatus(progress, l.id) === 'completed').length
          const lecStatus: LessonStatus = lecDone === lec.lessons.length ? 'completed' : lec.lessons.some((l) => lessonStatus(progress, l.id) !== 'not-started') ? 'in-progress' : 'not-started'
          return (
            <article key={lec.n} className="card card-pad lecture-card" aria-labelledby={`lec-${lec.n}`}>
              <header>
                <div>
                  <div className="lecture-num">
                    Ders {lec.n} · {lec.date}
                  </div>
                  <h2 id={`lec-${lec.n}`} style={{ margin: '2px 0 0' }}>
                    {lec.title}
                  </h2>
                  <div className="small muted">{lec.titleEn}</div>
                </div>
                <span className={'badge ' + (lecStatus === 'completed' ? 'done' : lecStatus === 'in-progress' ? 'progress' : '')}>
                  {lecDone}/{lec.lessons.length}
                </span>
              </header>
              <p className="small" style={{ margin: 0, color: 'var(--text-2)' }}>
                {lec.blurb}
              </p>
              <ul className="lesson-links">
                {lessons.map((l) => (
                  <li key={l.id}>
                    <Link to={`/ders/${l.id}`}>
                      <span className="status-dot">
                        <StatusIcon status={lessonStatus(progress, l.id)} />
                      </span>
                      <span className="grow">
                        <Inline src={l.title} />
                      </span>
                      <span className="small muted">{l.minutes} dk</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
      {LECTURES.every((lec) => !lec.lessons.some((l) => (filter === 'all' || lessonStatus(progress, l.id) === filter) && (!q || matches(l.title) || matches(l.titleEn) || matches(l.summary) || matches(lec.title)))) && (
        <p className="muted" role="status">
          Aramanızla eşleşen ders bulunamadı.
        </p>
      )}
      <p className="small muted" style={{ marginTop: 24 }}>
        Kapsam: Ders 1–7 (“Why are you here?”tan “Binary Search Trees and Red-Black Trees”e). Ders 8 (Hashing) ve sonrası bu sürümün kapsamı dışındadır.
      </p>
    </div>
  )
}

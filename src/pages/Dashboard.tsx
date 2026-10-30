import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, CircleDot, Dices, Hand, Search } from 'lucide-react'
import { allLessons, lectures, findLesson } from '../content/curriculum'
import { locale, tx } from '../i18n/lang'
import { useProgress } from '../state/ProgressContext'
import { lessonStatus, type LessonStatus } from '../state/progress'
import { Inline } from '../components/Tex'
import { LessonThumb } from '../components/LessonThumb'

export function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'completed') return <CheckCircle2 size={16} color="var(--st-sorted)" aria-label={tx('tamamlandı', 'completed')} />
  if (status === 'in-progress') return <CircleDot size={16} color="var(--st-compare)" aria-label={tx('devam ediyor', 'in progress')} />
  return <Circle size={16} color="var(--muted)" aria-label={tx('başlanmadı', 'not started')} />
}

const statusText = (s: LessonStatus): string =>
  s === 'completed' ? tx('Tamamlandı', 'Completed') : s === 'in-progress' ? tx('Devam ediyor', 'In progress') : tx('Başlanmadı', 'Not started')

type Filter = 'all' | LessonStatus

export function Dashboard() {
  const { progress } = useProgress()
  const ALL_LESSONS = allLessons()
  const LECTURES = lectures()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const done = ALL_LESSONS.filter((l) => lessonStatus(progress, l.id) === 'completed').length
  const pct = Math.round((done / ALL_LESSONS.length) * 100)
  const solved = Object.values(progress.quiz).filter((q) => q.correct).length
  const totalQ = ALL_LESSONS.reduce((s, l) => s + l.quiz.length, 0)
  const continueTarget = (() => {
    if (progress.lastLesson && findLesson(progress.lastLesson) && lessonStatus(progress, progress.lastLesson) !== 'completed') return findLesson(progress.lastLesson)!.lesson
    return ALL_LESSONS.find((l) => lessonStatus(progress, l.id) !== 'completed') ?? ALL_LESSONS[0]
  })()

  const q = query.trim().toLocaleLowerCase(locale())
  const matches = (text: string) => text.toLocaleLowerCase(locale()).includes(q)

  return (
    <div>
      <section className="hero">
        <div>
          <p className="lecture-num">{tx('CS161 · Ders 1–17 · Türkçe', 'CS161 · Lectures 1–17 · English')}</p>
          <h1>{tx('Algoritmaları görünür kıl.', 'Make algorithms visible.')}</h1>
          <p className="lead">
            {tx(
              'Algo View; algoritmaları adım adım çalıştırmanız, her adımın neden olduğunu görmeniz, kendi girdilerinizle deney yapmanız ve karmaşıklık analizini somut çalışmalara bağlamanız için tasarlanmış etkileşimli bir öğrenme ortamıdır.',
              'Algo View is an interactive learning environment for running algorithms step by step, seeing why each step happens, experimenting with your own inputs, and connecting complexity analysis to concrete runs.',
            )}
          </p>
          <div className="row">
            <Link className="btn primary" to={`/ders/${continueTarget.id}`}>
              {done === 0 && !progress.lastLesson ? tx('Öğrenmeye başla', 'Start learning') : tx('Kaldığın yerden devam et', 'Continue where you left off')} <ArrowRight size={16} aria-hidden />
            </Link>
            <span className="small muted">
              {tx('Sıradaki: Ders', 'Up next: Lecture')} {continueTarget.lecture} · {continueTarget.title}
            </span>
          </div>
        </div>
        <div className="card card-pad stack" aria-label={tx('İlerleme özeti', 'Progress summary')}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{tx('İlerlemen', 'Your progress')}</strong>
            <span className="mono">{pct}%</span>
          </div>
          <div className="progressbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={tx('Tamamlanan dersler', 'Completed lessons')}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <dl className="kv" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <dt>{tx('ders', 'lessons')}</dt>
              <dd>
                {done}/{ALL_LESSONS.length}
              </dd>
            </div>
            <div>
              <dt>{tx('soru', 'questions')}</dt>
              <dd>
                {solved}/{totalQ}
              </dd>
            </div>
            <div>
              <dt>{tx('konu', 'lectures')}</dt>
              <dd>{LECTURES.length}</dd>
            </div>
          </dl>
          <p className="small muted" style={{ margin: 0 }}>
            {tx('İlerleme yalnızca bu tarayıcıda saklanır. Ayarlar sayfasından sıfırlayabilirsiniz.', 'Progress is stored only in this browser. You can reset it on the Settings page.')}
          </p>
        </div>
      </section>

      <section className="card card-pad practice-cta" aria-labelledby="practice-cta-h">
        <div className="grow">
          <h2 id="practice-cta-h" style={{ fontSize: '1.05rem', margin: 0 }}>
            {tx('Alıştırma laboratuvarı', 'Practice lab')}
          </h2>
          <p className="small" style={{ margin: '4px 0 0', color: 'var(--text-2)' }}>
            {tx(
              'Algoritmaların kararlarını kendin ver (elle iz sürme) ya da her seferinde yeni girdiyle üretilen sorular çöz.',
              'Make the algorithms’ decisions yourself (hand tracing) or solve questions generated with a fresh input every time.',
            )}
          </p>
        </div>
        <Link className="btn" to="/alistirma">
          <Hand size={16} aria-hidden /> {tx('Elle iz sür', 'Trace by hand')}
        </Link>
        <Link className="btn" to="/alistirma?mod=soru">
          <Dices size={16} aria-hidden /> {tx('Soru üreteci', 'Question generator')}
        </Link>
      </section>

      <div className="filterbar" role="search">
        <label className="row" style={{ flex: '1 1 260px', gap: 6 }}>
          <Search size={16} aria-hidden className="muted" />
          <span className="sr-only">{tx('Konu ara', 'Search topics')}</span>
          <input className="input grow" placeholder={tx('Konu ara: ör. Master, pivot, kırmızı-siyah…', 'Search topics: e.g. Master, pivot, red-black…')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="seg" role="group" aria-label={tx('Duruma göre filtrele', 'Filter by status')}>
          {(['all', 'not-started', 'in-progress', 'completed'] as Filter[]).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? tx('Tümü', 'All') : statusText(f)}
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
                    {tx('Ders', 'Lecture')} {lec.n} · {lec.date}
                  </div>
                  <h2 id={`lec-${lec.n}`} style={{ margin: '2px 0 0' }}>
                    {lec.title}
                  </h2>
                  {lec.titleEn !== lec.title && <div className="small muted">{lec.titleEn}</div>}
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
                      <LessonThumb id={l.id} />
                      <span className="status-dot">
                        <StatusIcon status={lessonStatus(progress, l.id)} />
                      </span>
                      <span className="grow">
                        <Inline src={l.title} />
                      </span>
                      <span className="small muted">{l.minutes} {tx('dk', 'min')}</span>
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
          {tx('Aramanızla eşleşen ders bulunamadı.', 'No lessons match your search.')}
        </p>
      )}
      <section className="card card-pad closing-cta" aria-labelledby="closing-cta-h">
        <div className="grow">
          <div className="lecture-num">{tx('Ders 18 · Kapanış', 'Lecture 18 · Wrap-up')}</div>
          <h2 id="closing-cta-h" style={{ fontSize: '1.05rem', margin: '2px 0 0' }}>
            {tx('Sırada ne var?', 'What’s next?')}
          </h2>
          <p className="small" style={{ margin: '4px 0 0', color: 'var(--text-2)' }}>
            {tx(
              '17 dersin araç kutusu tek sayfada, birkaç “inci” (doğrusal programlama ve dualite, hata düzelten kodlar) ve buradan sonra nereye gidileceği.',
              'The toolbox of the 17 lectures on one page, a few “gems” (linear programming and duality, error-correcting codes) and where to go from here.',
            )}
          </p>
        </div>
        <Link className="btn" to="/kapanis">
          {tx('Kapanışı aç', 'Open the wrap-up')} <ArrowRight size={16} aria-hidden />
        </Link>
      </section>
    </div>
  )
}

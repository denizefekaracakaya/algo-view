import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, ListTree, RotateCcw } from 'lucide-react'
import { ALL_LESSONS, LECTURES, findLesson } from '../content/curriculum'
import type { Section, SourceRef } from '../content/types'
import { useProgress } from '../state/ProgressContext'
import { lessonStatus } from '../state/progress'
import { Inline, Rich } from '../components/Tex'
import { Pseudocode } from '../components/Pseudocode'
import { ProofStepper } from '../components/ProofStepper'
import { PracticeList, Quiz } from '../components/Quiz'
import { VIZ } from '../viz/registry'
import { StatusIcon } from './Dashboard'

const KIND_LABEL: Record<SourceRef['kind'], string> = {
  notes: 'Ders notu',
  slides: 'Slayt',
  pre: 'Ön alıştırma',
  notebook: 'Python not defteri',
  concept: 'Kavram kontrolü',
  homework: 'Ödev (yalnızca bağlantı)',
  section: 'Section',
  reading: 'Ek okuma',
  page: 'Sayfa',
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const found = findLesson(lessonId)
  const { progress, dispatch } = useProgress()
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    if (found) dispatch({ type: 'visit', lessonId: found.lesson.id, now: Date.now() })
    setTocOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  useEffect(() => {
    if (found) document.title = `${found.lesson.title} · Algo View`
    return () => {
      document.title = 'Algo View'
    }
  }, [found])

  if (!found)
    return (
      <div className="card card-pad">
        <h1>Ders bulunamadı</h1>
        <p>
          “{lessonId}” adlı bir ders yok. <Link to="/">Panele dön</Link>.
        </p>
      </div>
    )

  const { lesson, lecture, index } = found
  const status = lessonStatus(progress, lesson.id)
  const prev = ALL_LESSONS[index - 1]
  const next = ALL_LESSONS[index + 1]
  const quizSolved = lesson.quiz.filter((q) => progress.quiz[`${lesson.id}:${q.id}`]?.correct).length
  let n = 0

  return (
    <div className="lesson-layout">
      <nav className={'sidebar' + (tocOpen ? ' open' : '')} aria-label="Ders listesi" id="lesson-toc">
        {LECTURES.map((lec) => (
          <div key={lec.n}>
            <h2>
              Ders {lec.n} · {lec.titleEn}
            </h2>
            <ul>
              {lec.lessons.map((l) => (
                <li key={l.id}>
                  <Link to={`/ders/${l.id}`} aria-current={l.id === lesson.id ? 'page' : undefined}>
                    <StatusIcon status={lessonStatus(progress, l.id)} />
                    <span>
                      <Inline src={l.title} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <article aria-labelledby="lesson-title">
        <button className="btn sm toc-toggle" onClick={() => setTocOpen((o) => !o)} aria-expanded={tocOpen} aria-controls="lesson-toc" style={{ marginBottom: 12 }}>
          <ListTree size={15} aria-hidden /> Ders listesi
        </button>
        <header className="lesson-head">
          <div className="kicker">
            DERS {lecture.n} · {lecture.titleEn.toUpperCase()}
          </div>
          <h1 id="lesson-title">
            <Inline src={lesson.title} />
          </h1>
          <div className="title-en">{lesson.titleEn}</div>
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>
            <Inline src={lesson.summary} />
          </p>
          <div className="row small">
            <span className={'badge ' + (status === 'completed' ? 'done' : status === 'in-progress' ? 'progress' : '')}>
              {status === 'completed' ? 'Tamamlandı' : 'Devam ediyor'}
            </span>
            <span className="badge">~{lesson.minutes} dk</span>
            <span className="badge">
              Quiz {quizSolved}/{lesson.quiz.length}
            </span>
          </div>
        </header>

        <section className="section objectives" aria-label="Hedefler ve ön koşullar">
          <div className="card card-pad">
            <h2 style={{ fontSize: '1rem' }}>Öğrenme hedefleri</h2>
            <ul className="prose small" style={{ margin: 0 }}>
              {lesson.objectives.map((o, i) => (
                <li key={i}>
                  <Inline src={o} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <h2 style={{ fontSize: '1rem' }}>Ön koşullar</h2>
            <ul className="prose small" style={{ margin: 0 }}>
              {lesson.prerequisites.map((o, i) => (
                <li key={i}>
                  <Inline src={o} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {lesson.sections.map((s, i) => (
          <SectionView key={i} s={s} num={++n} />
        ))}

        <section className="section" aria-labelledby="quiz-h">
          <h2 id="quiz-h">
            <span className="section-num">{++n}</span> Mini quiz
          </h2>
          <Quiz lessonId={lesson.id} questions={lesson.quiz} />
        </section>

        {lesson.practice.length > 0 && (
          <section className="section" aria-labelledby="practice-h">
            <h2 id="practice-h">
              <span className="section-num">{++n}</span> Alıştırmalar
            </h2>
            <p className="small muted">Özgün alıştırmalar; önce kendiniz deneyin, ipuçlarını birer birer açın.</p>
            <PracticeList items={lesson.practice} />
          </section>
        )}

        <section className="section" aria-labelledby="src-h">
          <h2 id="src-h">
            <span className="section-num">{++n}</span> Resmî kaynaklar
          </h2>
          <ul className="prose small">
            {lesson.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label} <ExternalLink size={12} aria-hidden />
                  <span className="sr-only"> (yeni sekmede açılır)</span>
                </a>{' '}
                <span className="muted">— {KIND_LABEL[s.kind]}</span>
              </li>
            ))}
          </ul>
          <p className="small muted">Bu dersteki açıklamalar ve sorular Algo View tarafından özgün olarak yazılmıştır; resmî ödev çözümleri burada yer almaz.</p>
        </section>

        <section className="card card-pad section" aria-label="Dersi tamamla" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {status === 'completed' ? (
            <>
              <CheckCircle2 color="var(--st-sorted)" aria-hidden />
              <span className="grow">Bu dersi tamamladınız.</span>
              <button className="btn sm ghost" onClick={() => dispatch({ type: 'uncomplete', lessonId: lesson.id })}>
                <RotateCcw size={14} aria-hidden /> Tamamlanmadı olarak işaretle
              </button>
            </>
          ) : (
            <>
              <span className="grow">
                Hedefleri karşılayabildiğinizi düşünüyor musunuz? {quizSolved < lesson.quiz.length && <span className="muted">(Quizde {lesson.quiz.length - quizSolved} soru kaldı.)</span>}
              </span>
              <button className="btn primary" onClick={() => dispatch({ type: 'complete', lessonId: lesson.id, now: Date.now() })}>
                <CheckCircle2 size={16} aria-hidden /> Dersi tamamlandı olarak işaretle
              </button>
            </>
          )}
        </section>

        <nav className="lesson-nav" aria-label="Önceki / sonraki ders">
          {prev ? (
            <Link className="btn" to={`/ders/${prev.id}`}>
              <ArrowLeft size={16} aria-hidden /> <Inline src={prev.title} />
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="btn primary" to={`/ders/${next.id}`}>
              <Inline src={next.title} /> <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <Link className="btn primary" to="/">
              Panele dön <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}

function SectionView({ s, num }: { s: Section; num: number }) {
  const Viz = s.viz ? VIZ[s.viz] : null
  const id = `sec-${num}`
  return (
    <section className="section" aria-labelledby={id}>
      <h2 id={id}>
        <span className="section-num">{num}</span> <Inline src={s.title} />
      </h2>
      {s.label && <span className="label-tag">{s.label === 'Sezgi' ? 'Sezgisel açıklama (kanıt değildir)' : s.label}</span>}
      {s.body &&
        (s.box ? (
          <div className={'callout ' + (s.box === 'formal' ? 'formal' : s.box === 'warn' ? 'warn' : '')}>
            <Rich text={s.body} />
          </div>
        ) : (
          <Rich text={s.body} />
        ))}
      {s.code && <Pseudocode lines={s.code} />}
      {s.proof && <ProofStepper steps={s.proof} />}
      {Viz && (
        <div style={{ marginTop: 10 }}>
          <Viz />
        </div>
      )}
    </section>
  )
}

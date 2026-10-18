import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, ListTree, RotateCcw } from 'lucide-react'
import { allLessons, lectures, findLesson } from '../content/curriculum'
import { tx } from '../i18n/lang'
import type { Section, SourceRef } from '../content/types'
import { useProgress } from '../state/ProgressContext'
import { lessonStatus } from '../state/progress'
import { Inline, Rich } from '../components/Tex'
import { Pseudocode } from '../components/Pseudocode'
import { ProofStepper } from '../components/ProofStepper'
import { PracticeList, Quiz } from '../components/Quiz'
import { VIZ } from '../viz/registry'
import { StatusIcon } from './Dashboard'

const kindLabel = (k: SourceRef['kind']): string =>
  ({
    notes: tx('Ders notu', 'Lecture notes'),
    slides: tx('Slayt', 'Slides'),
    pre: tx('Ön alıştırma', 'Pre-lecture exercise'),
    notebook: tx('Python not defteri', 'Python notebook'),
    concept: tx('Kavram kontrolü', 'Concept check'),
    homework: tx('Ödev (yalnızca bağlantı)', 'Homework (link only)'),
    section: 'Section',
    reading: tx('Ek okuma', 'Further reading'),
    page: tx('Sayfa', 'Page'),
  })[k]

const sectionLabel = (l: NonNullable<Section['label']>): string =>
  ({
    intuition: tx('Sezgisel açıklama (kanıt değildir)', 'Intuitive explanation (not a proof)'),
    formal: tx('Biçimsel', 'Formal'),
    proofIdea: tx('Kanıt fikri', 'Proof idea'),
    formalProof: tx('Biçimsel kanıt', 'Formal proof'),
  })[l]

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
        <h1>{tx('Ders bulunamadı', 'Lesson not found')}</h1>
        <p>
          {tx(`“${lessonId}” adlı bir ders yok.`, `There is no lesson called “${lessonId}”.`)} <Link to="/">{tx('Panele dön', 'Back to dashboard')}</Link>.
        </p>
      </div>
    )

  const { lesson, lecture, index } = found
  const status = lessonStatus(progress, lesson.id)
  const ALL_LESSONS = allLessons()
  const LECTURES = lectures()
  const prev = ALL_LESSONS[index - 1]
  const next = ALL_LESSONS[index + 1]
  const quizSolved = lesson.quiz.filter((q) => progress.quiz[`${lesson.id}:${q.id}`]?.correct).length
  let n = 0

  return (
    <div className="lesson-layout">
      <nav className={'sidebar' + (tocOpen ? ' open' : '')} aria-label={tx('Ders listesi', 'Lesson list')} id="lesson-toc">
        {LECTURES.map((lec) => (
          <div key={lec.n}>
            <h2>
              {tx('Ders', 'Lecture')} {lec.n} · {lec.titleEn}
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
          <ListTree size={15} aria-hidden /> {tx('Ders listesi', 'Lesson list')}
        </button>
        <header className="lesson-head">
          <div className="kicker">
            {tx('DERS', 'LECTURE')} {lecture.n} · {lecture.titleEn.toUpperCase()}
          </div>
          <h1 id="lesson-title">
            <Inline src={lesson.title} />
          </h1>
          {lesson.titleEn !== lesson.title && <div className="title-en">{lesson.titleEn}</div>}
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>
            <Inline src={lesson.summary} />
          </p>
          <div className="row small">
            <span className={'badge ' + (status === 'completed' ? 'done' : status === 'in-progress' ? 'progress' : '')}>
              {status === 'completed' ? tx('Tamamlandı', 'Completed') : tx('Devam ediyor', 'In progress')}
            </span>
            <span className="badge">~{lesson.minutes} {tx('dk', 'min')}</span>
            <span className="badge">
              Quiz {quizSolved}/{lesson.quiz.length}
            </span>
          </div>
        </header>

        <section className="section objectives" aria-label={tx('Hedefler ve ön koşullar', 'Objectives and prerequisites')}>
          <div className="card card-pad">
            <h2 style={{ fontSize: '1rem' }}>{tx('Öğrenme hedefleri', 'Learning objectives')}</h2>
            <ul className="prose small" style={{ margin: 0 }}>
              {lesson.objectives.map((o, i) => (
                <li key={i}>
                  <Inline src={o} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <h2 style={{ fontSize: '1rem' }}>{tx('Ön koşullar', 'Prerequisites')}</h2>
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
              <span className="section-num">{++n}</span> {tx('Alıştırmalar', 'Practice problems')}
            </h2>
            <p className="small muted">{tx('Özgün alıştırmalar; önce kendiniz deneyin, ipuçlarını birer birer açın.', 'Original problems; try them yourself first and reveal the hints one at a time.')}</p>
            <PracticeList items={lesson.practice} />
          </section>
        )}

        <section className="section" aria-labelledby="src-h">
          <h2 id="src-h">
            <span className="section-num">{++n}</span> {tx('Resmî kaynaklar', 'Official sources')}
          </h2>
          <ul className="prose small">
            {lesson.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {tx(s.label, s.labelEn)} <ExternalLink size={12} aria-hidden />
                  <span className="sr-only"> {tx('(yeni sekmede açılır)', '(opens in a new tab)')}</span>
                </a>{' '}
                <span className="muted">— {kindLabel(s.kind)}</span>
              </li>
            ))}
          </ul>
          <p className="small muted">
            {tx(
              'Bu dersteki açıklamalar ve sorular Algo View tarafından özgün olarak yazılmıştır; resmî ödev çözümleri burada yer almaz.',
              'The explanations and questions in this lesson were written originally for Algo View; official homework solutions are not included.',
            )}
          </p>
        </section>

        <section className="card card-pad section" aria-label={tx('Dersi tamamla', 'Complete the lesson')} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {status === 'completed' ? (
            <>
              <CheckCircle2 color="var(--st-sorted)" aria-hidden />
              <span className="grow">{tx('Bu dersi tamamladınız.', 'You have completed this lesson.')}</span>
              <button className="btn sm ghost" onClick={() => dispatch({ type: 'uncomplete', lessonId: lesson.id })}>
                <RotateCcw size={14} aria-hidden /> {tx('Tamamlanmadı olarak işaretle', 'Mark as not completed')}
              </button>
            </>
          ) : (
            <>
              <span className="grow">
                {tx('Hedefleri karşılayabildiğinizi düşünüyor musunuz?', 'Do you feel you can meet the objectives?')}{' '}
                {quizSolved < lesson.quiz.length && (
                  <span className="muted">{tx(`(Quizde ${lesson.quiz.length - quizSolved} soru kaldı.)`, `(${lesson.quiz.length - quizSolved} quiz questions left.)`)}</span>
                )}
              </span>
              <button className="btn primary" onClick={() => dispatch({ type: 'complete', lessonId: lesson.id, now: Date.now() })}>
                <CheckCircle2 size={16} aria-hidden /> {tx('Dersi tamamlandı olarak işaretle', 'Mark lesson as completed')}
              </button>
            </>
          )}
        </section>

        <nav className="lesson-nav" aria-label={tx('Önceki / sonraki ders', 'Previous / next lesson')}>
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
              {tx('Panele dön', 'Back to dashboard')} <ArrowRight size={16} aria-hidden />
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
      {s.label && <span className="label-tag">{sectionLabel(s.label)}</span>}
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

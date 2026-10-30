import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lectures } from '../content/curriculum'
import { tx } from '../i18n/lang'
import { COURSE, SRC } from '../content/sources'

export function SourcesPage() {
  return (
    <div className="stack" style={{ maxWidth: 900 }}>
      <h1>{tx('Kaynaklar', 'Sources')}</h1>
      <p>
        {tx(
          'Algo View’un içeriği Stanford CS161 (Winter 2026) dersinin kamuya açık materyalleri incelenerek hazırlanmıştır. Açıklamalar, örnekler ve sorular özgündür; aşağıdaki bağlantılar resmî kaynakları yeni sekmede açar. Algo View, Stanford Üniversitesi ile bağlantılı değildir.',
          'Algo View’s content was prepared by studying the public materials of Stanford CS161 (Winter 2026). Explanations, examples and questions are original; the links below open the official sources in a new tab. Algo View is not affiliated with Stanford University.',
        )}
      </p>
      <div className="card card-pad">
        <h2>{tx('Ders sitesi', 'Course website')}</h2>
        <ul className="prose">
          {[
            [tx('Dersler (Lectures)', 'Lectures'), COURSE.lectures],
            [tx('Ödevler (Homework)', 'Homework'), COURSE.homework],
            [tx('Program (Schedule)', 'Schedule'), COURSE.schedule],
            [tx('Section’lar', 'Sections'), COURSE.sections],
          ].map(([label, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {label} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
      {lectures().map((lec) => {
        const urls = new Map<string, { label: string; labelEn: string; url: string }>()
        for (const l of lec.lessons) for (const s of l.sources) urls.set(s.url, s)
        return (
          <div key={lec.n} className="card card-pad">
            <h2>
              {tx('Ders', 'Lecture')} {lec.n}: {lec.titleEn}
            </h2>
            <p className="small muted">
              {tx('Algo View dersleri:', 'Algo View lessons:')}{' '}
              {lec.lessons.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && ' · '}
                  <Link to={`/ders/${l.id}`}>{l.title.replace(/\$/g, '')}</Link>
                </span>
              ))}
            </p>
            <ul className="prose small">
              {[...urls.values()].map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {tx(s.label, s.labelEn)} <ExternalLink size={12} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      <div className="card card-pad">
        <h2>{tx('Ders 18', 'Lecture 18')}: What’s next?</h2>
        <p className="small muted">
          {tx('Algo View sayfası:', 'Algo View page:')} <Link to="/kapanis">{tx('Sırada ne var?', 'What’s next?')}</Link>
        </p>
        <ul className="prose small">
          <li>
            <a href={SRC.l18.slides.url} target="_blank" rel="noopener noreferrer">
              {tx(SRC.l18.slides.label, SRC.l18.slides.labelEn)} <ExternalLink size={12} aria-hidden />
            </a>
          </li>
        </ul>
      </div>
      <div className="card card-pad">
        <h2>{tx('Ödevler ve section’lar', 'Homework and sections')}</h2>
        <p className="small">
          {tx(
            'Ödevler yalnızca öğrenme hedeflerini anlamak için incelendi. Algo View resmî ödev çözümlerini içermez ve ödev sorularını yeniden yayınlamaz.',
            'Homework was studied only to understand the learning objectives. Algo View contains no official homework solutions and does not republish homework questions.',
          )}
        </p>
        <ul className="prose small">
          {[...Object.values(SRC.hw), ...Object.values(SRC.sec)].map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {tx(s.label, s.labelEn)} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

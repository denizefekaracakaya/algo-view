import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LECTURES } from '../content/curriculum'
import { COURSE, SRC } from '../content/sources'

export function SourcesPage() {
  return (
    <div className="stack" style={{ maxWidth: 900 }}>
      <h1>Kaynaklar</h1>
      <p>
        Algo View’un içeriği Stanford CS161 (Winter 2026) dersinin kamuya açık materyalleri incelenerek hazırlanmıştır. Açıklamalar, örnekler ve sorular özgündür; aşağıdaki bağlantılar resmî kaynakları yeni sekmede açar.
        Algo View, Stanford Üniversitesi ile bağlantılı değildir.
      </p>
      <div className="card card-pad">
        <h2>Ders sitesi</h2>
        <ul className="prose">
          {[
            ['Dersler (Lectures)', COURSE.lectures],
            ['Ödevler (Homework)', COURSE.homework],
            ['Program (Schedule)', COURSE.schedule],
            ['Section’lar', COURSE.sections],
          ].map(([label, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {label} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
      {LECTURES.map((lec) => {
        const urls = new Map<string, { label: string; url: string }>()
        for (const l of lec.lessons) for (const s of l.sources) urls.set(s.url, s)
        return (
          <div key={lec.n} className="card card-pad">
            <h2>
              Ders {lec.n}: {lec.titleEn}
            </h2>
            <p className="small muted">
              Algo View dersleri:{' '}
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
                    {s.label} <ExternalLink size={12} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      <div className="card card-pad">
        <h2>Ödevler ve section’lar</h2>
        <p className="small">Ödevler yalnızca öğrenme hedeflerini anlamak için incelendi. Algo View resmî ödev çözümlerini içermez ve ödev sorularını yeniden yayınlamaz.</p>
        <ul className="prose small">
          {[...Object.values(SRC.hw), ...Object.values(SRC.sec)].map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { Choice, KV, Legend } from '../components/VizParts'
import { GS_CODE, MATCHING_AGREE, MATCHING_CASCADE, MATCHING_EXAMPLE, blockingPairs, galeShapleyTrace, type Prefs } from '../engines/stableMatching'
import { tx } from '../i18n/lang'

const SETS = (): Record<string, { p: Prefs; label: string }> => ({
  notes: { p: MATCHING_EXAMPLE, label: tx('Notlardaki yapı (3 × 3)', 'Structure of the notes’ example (3 × 3)') },
  cascade: { p: MATCHING_CASCADE, label: tx('Zincirleme reddetmeler (4 × 4)', 'Cascading rejections (4 × 4)') },
  agree: { p: MATCHING_AGREE, label: tx('Herkes aynı sırada (4 × 4)', 'Everyone agrees (4 × 4)') },
})

export function StableMatchingViz() {
  const [key, setKey] = useState('notes')
  const S = SETS()
  const p = S[key].p
  const { trace, match } = useMemo(() => galeShapleyTrace(p), [p])
  return (
    <TraceViewer
      key={key}
      trace={trace}
      label={tx('Kabulü erteleme algoritması görselleştirmesi', 'Deferred acceptance visualization')}
      code={GS_CODE}
      toolbar={<Choice label={tx('Tercihler', 'Preferences')} value={key} onChange={setKey} options={Object.entries(S).map(([k, v]) => ({ value: k, label: v.label }))} />}
      render={(step) => {
        const s = step.state
        const hospOf = (d: string) => p.hospitals.find((h) => s.match[h] === d)
        const rejectedBy = (d: string, h: string) => s.rejected.some(([a, b]) => a === d && b === h)
        return (
          <div className="match-grid">
            <div>
              <div className="label-tag">{tx('Doktorlar (en çok istenenden aza)', 'Doctors (most to least preferred)')}</div>
              <ul className="pref-list">
                {p.doctors.map((d) => (
                  <li key={d} className={s.proposal?.d === d ? 'current' : undefined}>
                    <strong>{d}</strong>
                    <span className="pref-row">
                      {p.dPref[d].map((h, k) => (
                        <span key={h} className={'pref ' + (hospOf(d) === h ? 'matched' : rejectedBy(d, h) ? 'rejected' : s.proposal?.d === d && s.proposal.h === h ? 'proposing' : k < s.next[d] ? 'tried' : '')}>
                          {h}
                        </span>
                      ))}
                    </span>
                    {!hospOf(d) && <span className="small muted">{tx('boşta', 'free')}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="label-tag">{tx('Hastaneler (en çok istenenden aza)', 'Hospitals (most to least preferred)')}</div>
              <ul className="pref-list">
                {p.hospitals.map((h) => (
                  <li key={h} className={s.proposal?.h === h ? 'current' : undefined}>
                    <strong>{h}</strong>
                    <span className="pref-row">
                      {p.hPref[h].map((d) => (
                        <span key={d} className={'pref ' + (s.match[h] === d ? 'matched' : s.proposal?.h === h && s.proposal.d === d ? 'proposing' : '')}>
                          {d}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }}
      side={(step) => (
        <KV
          items={[
            [tx('boşta', 'free'), step.state.free.join(', ') || '—'],
            [tx('engelleyen çift', 'blocking pairs'), step.state.free.length ? '…' : blockingPairs(p, match).length],
          ]}
        />
      )}
      legend={
        <Legend
          items={[
            { color: 'var(--st-sorted-bg)', border: 'var(--st-sorted)', label: tx('geçici / son eşleşme', 'tentative / final match') },
            { color: 'var(--st-compare-bg)', border: 'var(--st-compare)', label: tx('şu anki teklif', 'current proposal') },
            { color: 'var(--st-bad-bg)', border: 'var(--st-bad)', label: tx('reddedildi', 'rejected') },
          ]}
        />
      }
    />
  )
}

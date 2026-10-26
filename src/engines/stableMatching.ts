import type { Trace, TraceStep } from '../trace/types'
import { tx } from '../i18n/lang'

/** Lecture 17: stable matching with the deferred acceptance (Gale–Shapley) algorithm, doctors proposing. */

export interface Prefs {
  doctors: string[]
  hospitals: string[]
  /** dPref[d] = hospitals from most to least preferred. */
  dPref: Record<string, string[]>
  /** hPref[h] = doctors from most to least preferred. */
  hPref: Record<string, string[]>
}

/** Same preference structure as the example in the notes, with our own names. */
export const MATCHING_EXAMPLE: Prefs = {
  doctors: ['Ada', 'Bora', 'Can'],
  hospitals: ['X', 'Y', 'Z'],
  dPref: { Ada: ['Y', 'X', 'Z'], Bora: ['X', 'Y', 'Z'], Can: ['X', 'Y', 'Z'] },
  hPref: { X: ['Ada', 'Can', 'Bora'], Y: ['Can', 'Ada', 'Bora'], Z: ['Bora', 'Can', 'Ada'] },
}

/** Everybody agrees on the order (our own example): the result is the “assortative” matching. */
export const MATCHING_AGREE: Prefs = {
  doctors: ['Ada', 'Bora', 'Can', 'Deniz'],
  hospitals: ['W', 'X', 'Y', 'Z'],
  dPref: { Ada: ['W', 'X', 'Y', 'Z'], Bora: ['W', 'X', 'Y', 'Z'], Can: ['W', 'X', 'Y', 'Z'], Deniz: ['W', 'X', 'Y', 'Z'] },
  hPref: { W: ['Deniz', 'Can', 'Bora', 'Ada'], X: ['Deniz', 'Can', 'Bora', 'Ada'], Y: ['Deniz', 'Can', 'Bora', 'Ada'], Z: ['Deniz', 'Can', 'Bora', 'Ada'] },
}

/** Four doctors with crossing preferences, so rejections cascade (our own example). */
export const MATCHING_CASCADE: Prefs = {
  doctors: ['Ada', 'Bora', 'Can', 'Deniz'],
  hospitals: ['W', 'X', 'Y', 'Z'],
  dPref: { Ada: ['W', 'X', 'Y', 'Z'], Bora: ['W', 'Y', 'X', 'Z'], Can: ['X', 'W', 'Z', 'Y'], Deniz: ['W', 'Z', 'X', 'Y'] },
  hPref: { W: ['Can', 'Deniz', 'Bora', 'Ada'], X: ['Ada', 'Bora', 'Deniz', 'Can'], Y: ['Bora', 'Ada', 'Can', 'Deniz'], Z: ['Deniz', 'Can', 'Ada', 'Bora'] },
}

export const GS_CODE = [
  'DeferredAcceptance(D, H):',
  '    every doctor is free; every hospital is empty',
  '    while some doctor d is free:',
  '        h = the next hospital on d’s list',
  '        if h is empty or h prefers d to h.doctor:',
  '            free h.doctor (if any); h.doctor = d',
  '        else: h rejects d (d stays free)',
  '    return {(h.doctor, h)}',
]

export interface MatchState {
  /** hospital → doctor (or null). */
  match: Record<string, string | null>
  /** next index into each doctor’s list. */
  next: Record<string, number>
  free: string[]
  proposal: { d: string; h: string; accepted: boolean } | null
  /** Pairs (doctor, hospital) that have been rejected so far. */
  rejected: [string, string][]
}

export function galeShapleyTrace(p: Prefs): { trace: Trace<MatchState>; match: Record<string, string> } {
  const match: Record<string, string | null> = Object.fromEntries(p.hospitals.map((h) => [h, null]))
  const next: Record<string, number> = Object.fromEntries(p.doctors.map((d) => [d, 0]))
  const free = [...p.doctors]
  const rejected: [string, string][] = []
  const trace: Trace<MatchState> = []
  let proposals = 0
  const rank = (h: string, d: string) => p.hPref[h].indexOf(d)
  const push = (proposal: MatchState['proposal'], step: Omit<TraceStep<MatchState>, 'state'>) =>
    trace.push({ ...step, state: { match: { ...match }, next: { ...next }, free: [...free], proposal, rejected: rejected.map((r) => [...r] as [string, string]) }, counters: { [tx('teklif', 'proposals')]: proposals } })
  push(null, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx('Tüm doktorlar boşta, tüm hastaneler boş.', 'All doctors are free and all hospitals are empty.') })
  while (free.length) {
    const d = free[0]
    const h = p.dPref[d][next[d]]
    next[d]++
    proposals++
    const cur = match[h]
    const accepted = cur === null || rank(h, d) < rank(h, cur)
    const why = cur === null ? tx(`${h} boş.`, `${h} is empty.`) : accepted ? tx(`${h}, ${d}'yi ${cur}'a tercih ediyor.`, `${h} prefers ${d} to ${cur}.`) : tx(`${h}, ${cur}'ı ${d}'ye tercih ediyor.`, `${h} prefers ${cur} to ${d}.`)
    push(
      { d, h, accepted },
      {
        line: 4,
        phase: tx(`Teklif ${proposals}`, `Proposal ${proposals}`),
        explain: tx(`${d} listesindeki sıradaki hastaneye, ${h}'ye başvuruyor${cur ? ` (${h} şu an ${cur} ile geçici eşleşmiş)` : ''}.`, `${d} applies to the next hospital on the list, ${h}${cur ? ` (${h} is tentatively matched with ${cur})` : ''}.`),
        predict: {
          question: tx(`${h}, ${d}'yi kabul eder mi?`, `Does ${h} accept ${d}?`),
          options: [tx('Kabul eder', 'Accepts'), tx('Reddeder', 'Rejects')],
          answer: accepted ? 0 : 1,
          why,
        },
      },
    )
    if (accepted) {
      free.shift()
      if (cur) {
        free.push(cur)
        rejected.push([cur, h])
      }
      match[h] = d
      push({ d, h, accepted }, { line: 6, phase: tx(`Teklif ${proposals}`, `Proposal ${proposals}`), explain: cur ? tx(`${why} ${h}: ${d} (geçici). ${cur} yeniden boşta.`, `${why} ${h}: ${d} (tentative). ${cur} is free again.`) : tx(`${why} ${h}: ${d} (geçici; daha iyi biri gelirse bozulabilir).`, `${why} ${h}: ${d} (tentative; it can be broken if someone better applies).`) })
    } else {
      rejected.push([d, h])
      push({ d, h, accepted }, { line: 7, phase: tx(`Teklif ${proposals}`, `Proposal ${proposals}`), explain: tx(`${why} ${d} reddedildi ve boşta kalıyor.`, `${why} ${d} is rejected and stays free.`) })
    }
  }
  const final = match as Record<string, string>
  push(null, {
    line: 8,
    phase: tx('Bitti', 'Done'),
    explain: tx(
      `Boşta doktor kalmadı: ${p.hospitals.map((h) => `${final[h]}–${h}`).join(', ')}. ${proposals} teklif (en fazla n² = ${p.doctors.length ** 2}). Eşleşme kararlı ve doktorlar için en iyisi.`,
      `No doctor is free: ${p.hospitals.map((h) => `${final[h]}–${h}`).join(', ')}. ${proposals} proposals (at most n² = ${p.doctors.length ** 2}). The matching is stable and doctor-optimal.`,
    ),
  })
  return { trace, match: final }
}

/** Blocking pairs (d, h) of a complete matching given as hospital → doctor. */
export function blockingPairs(p: Prefs, match: Record<string, string>): [string, string][] {
  const hospOf: Record<string, string> = {}
  for (const h of p.hospitals) hospOf[match[h]] = h
  const out: [string, string][] = []
  for (const d of p.doctors)
    for (const h of p.hospitals) {
      if (hospOf[d] === h) continue
      const dPrefers = p.dPref[d].indexOf(h) < p.dPref[d].indexOf(hospOf[d])
      const hPrefers = p.hPref[h].indexOf(d) < p.hPref[h].indexOf(match[h])
      if (dPrefers && hPrefers) out.push([d, h])
    }
  return out
}

/** All stable matchings by brute force over permutations (n ≤ 6; for tests). */
export function allStableMatchings(p: Prefs): Record<string, string>[] {
  const out: Record<string, string>[] = []
  const perm = (rest: string[], acc: string[]) => {
    if (!rest.length) {
      const m = Object.fromEntries(p.hospitals.map((h, i) => [h, acc[i]]))
      if (!blockingPairs(p, m).length) out.push(m)
      return
    }
    rest.forEach((d, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, d]))
  }
  perm(p.doctors, [])
  return out
}

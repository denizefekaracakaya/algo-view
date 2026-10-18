/**
 * Exam mode: a mixed set drawn from the lessons' quiz and in-text questions plus freshly
 * generated questions, answered without feedback and graded at the end.
 */
import type { Question } from '../content/types'
import { allLessons } from '../content/curriculum'
import { makeRng, randInt, type Rng } from '../engines/random'
import { GENERATORS, generate } from './generators'

export interface ExamItem {
  key: string
  lessonId: string
  source: 'gen' | 'quiz' | 'check'
  q: Question
}

/** mcq: chosen option index; numeric: the typed text; order: the learner's order of items. */
export type ExamAnswer = number | string | string[] | null

function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Fixed questions (quiz + in-text checks) of the chosen lessons, in the active language. */
export function staticPool(lessonIds: readonly string[]): ExamItem[] {
  const out: ExamItem[] = []
  for (const l of allLessons()) {
    if (!lessonIds.includes(l.id)) continue
    for (const q of l.quiz) out.push({ key: `${l.id}:quiz:${q.id}`, lessonId: l.id, source: 'quiz', q })
    for (const s of l.sections) for (const q of s.check ?? []) out.push({ key: `${l.id}:check:${q.id}`, lessonId: l.id, source: 'check', q })
  }
  return out
}

/**
 * Roughly half generated, half fixed questions (when the lessons have generators), shuffled.
 * Fixed questions never repeat; generated ones use distinct seeds.
 */
export function buildExam(lessonIds: readonly string[], count: number, seed: number): ExamItem[] {
  const rng = makeRng(seed)
  const fixed = shuffle(rng, staticPool(lessonIds))
  const gens = GENERATORS.filter((g) => lessonIds.includes(g.lessonId))
  const items: ExamItem[] = []
  for (let i = 0; i < count; i++) {
    const wantGen = gens.length > 0 && (i % 2 === 0 || fixed.length === 0)
    if (wantGen) {
      const g = gens[randInt(rng, 0, gens.length - 1)]
      const s = randInt(rng, 1, 1e9)
      items.push({ key: `gen:${g.id}:${s}`, lessonId: g.lessonId, source: 'gen', q: generate(g, s) })
    } else if (fixed.length) {
      items.push(fixed.pop()!)
    } else break
  }
  return shuffle(rng, items)
}

export function parseNumber(text: string): number | null {
  const t = text.trim().replace(',', '.')
  if (!t) return null
  const v = Number(t)
  return Number.isFinite(v) ? v : null
}

export function isAnswered(a: ExamAnswer): boolean {
  return a !== null && !(typeof a === 'string' && a.trim() === '')
}

export function grade(q: Question, a: ExamAnswer): boolean {
  if (a === null) return false
  switch (q.kind) {
    case 'mcq':
      return a === q.answer
    case 'numeric': {
      const v = typeof a === 'string' ? parseNumber(a) : null
      return v !== null && Math.abs(v - q.answer) <= (q.tolerance ?? 1e-9)
    }
    case 'order':
      return Array.isArray(a) && a.length === q.items.length && a.every((x, i) => x === q.items[i])
  }
}

/** Initial order shown for an order question: a seeded shuffle that is never already correct. */
export function initialOrder(items: readonly string[], seed: number): string[] {
  if (items.length < 2) return [...items]
  let out = shuffle(makeRng(seed), items)
  if (out.every((x, i) => x === items[i])) out = [...items].reverse()
  return out
}

export interface LessonScore {
  lessonId: string
  total: number
  correct: number
}

export function scoreByLesson(items: readonly ExamItem[], answers: Record<string, ExamAnswer>): LessonScore[] {
  const map = new Map<string, LessonScore>()
  for (const it of items) {
    const s = map.get(it.lessonId) ?? { lessonId: it.lessonId, total: 0, correct: 0 }
    s.total++
    if (grade(it.q, answers[it.key] ?? null)) s.correct++
    map.set(it.lessonId, s)
  }
  const order = allLessons().map((l) => l.id)
  return [...map.values()].sort((x, y) => order.indexOf(x.lessonId) - order.indexOf(y.lessonId))
}

/** Local, versioned progress persistence. All storage access is wrapped so the app works without it. */
import type { Lang } from '../i18n/lang'

export type LessonStatus = 'not-started' | 'in-progress' | 'completed'
export type ThemePref = 'system' | 'light' | 'dark'

export interface QuizRecord {
  correct: boolean
  attempts: number
}

export interface ProgressData {
  version: 1
  lessons: Record<string, { status: Exclude<LessonStatus, 'not-started'>; visitedAt: number; completedAt?: number }>
  quiz: Record<string, QuizRecord>
  /** Section indices the learner has scrolled through, per lesson. */
  read: Record<string, number[]>
  /** Hand-tracing drills: completed runs, runs without a mistake. */
  drills: Record<string, { runs: number; perfect: number }>
  /** Generated questions per generator: solved questions and checks made. */
  gen: Record<string, { solved: number; attempts: number }>
  /** Personal notes per lesson (kept on progress reset: they are the learner's own writing). */
  notes: Record<string, { text: string; updatedAt: number }>
  /** Finished exams, newest first (at most MAX_EXAMS). */
  exams: ExamRecord[]
  /** Coding exercises: the learner's latest code and whether all tests ever passed. */
  code: Record<string, { src: string; solved: boolean }>
  lastLesson: string | null
  prefs: { theme: ThemePref; speed: number; predict: boolean; lang: Lang }
}

export interface ExamRecord {
  at: number
  total: number
  correct: number
  seconds: number
  lessons: string[]
}

export const MAX_EXAMS = 20

export const STORAGE_KEY = 'algoview:progress:v1'

export const emptyProgress = (): ProgressData => ({
  version: 1,
  lessons: {},
  quiz: {},
  read: {},
  drills: {},
  gen: {},
  notes: {},
  exams: [],
  code: {},
  lastLesson: null,
  prefs: { theme: 'system', speed: 1, predict: false, lang: 'tr' },
})

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressData>
    if (parsed.version !== 1) return emptyProgress()
    const base = emptyProgress()
    return {
      ...base,
      ...parsed,
      lessons: parsed.lessons ?? {},
      quiz: parsed.quiz ?? {},
      read: parsed.read ?? {},
      drills: parsed.drills ?? {},
      gen: parsed.gen ?? {},
      notes: parsed.notes ?? {},
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      code: parsed.code ?? {},
      prefs: { ...base.prefs, ...(parsed.prefs ?? {}) },
    } as ProgressData
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable (private mode, quota) — progress stays in memory */
  }
}

export type ProgressAction =
  | { type: 'visit'; lessonId: string; now: number }
  | { type: 'complete'; lessonId: string; now: number }
  | { type: 'uncomplete'; lessonId: string }
  | { type: 'quiz'; key: string; correct: boolean }
  | { type: 'read'; lessonId: string; section: number }
  | { type: 'drill'; id: string; mistakes: number }
  | { type: 'gen'; id: string; solved: boolean }
  | { type: 'note'; lessonId: string; text: string; now: number }
  | { type: 'exam'; record: ExamRecord }
  | { type: 'code'; id: string; src?: string; solved?: boolean }
  | { type: 'prefs'; prefs: Partial<ProgressData['prefs']> }
  | { type: 'reset' }

export function progressReducer(s: ProgressData, a: ProgressAction): ProgressData {
  switch (a.type) {
    case 'visit': {
      const cur = s.lessons[a.lessonId]
      return {
        ...s,
        lastLesson: a.lessonId,
        lessons: { ...s.lessons, [a.lessonId]: cur ? { ...cur, visitedAt: a.now } : { status: 'in-progress', visitedAt: a.now } },
      }
    }
    case 'complete':
      return { ...s, lessons: { ...s.lessons, [a.lessonId]: { status: 'completed', visitedAt: a.now, completedAt: a.now } } }
    case 'uncomplete': {
      const cur = s.lessons[a.lessonId]
      if (!cur) return s
      return { ...s, lessons: { ...s.lessons, [a.lessonId]: { status: 'in-progress', visitedAt: cur.visitedAt } } }
    }
    case 'quiz': {
      const prev = s.quiz[a.key]
      // Once answered correctly it stays correct; attempts keep counting.
      return { ...s, quiz: { ...s.quiz, [a.key]: { correct: (prev?.correct ?? false) || a.correct, attempts: (prev?.attempts ?? 0) + 1 } } }
    }
    case 'read': {
      const cur = s.read[a.lessonId] ?? []
      if (cur.includes(a.section)) return s
      return { ...s, read: { ...s.read, [a.lessonId]: [...cur, a.section].sort((x, y) => x - y) } }
    }
    case 'drill': {
      const cur = s.drills[a.id] ?? { runs: 0, perfect: 0 }
      return { ...s, drills: { ...s.drills, [a.id]: { runs: cur.runs + 1, perfect: cur.perfect + (a.mistakes === 0 ? 1 : 0) } } }
    }
    case 'gen': {
      const cur = s.gen[a.id] ?? { solved: 0, attempts: 0 }
      return { ...s, gen: { ...s.gen, [a.id]: { solved: cur.solved + (a.solved ? 1 : 0), attempts: cur.attempts + 1 } } }
    }
    case 'note': {
      const notes = { ...s.notes }
      if (a.text.trim()) notes[a.lessonId] = { text: a.text, updatedAt: a.now }
      else delete notes[a.lessonId]
      return { ...s, notes }
    }
    case 'exam':
      return { ...s, exams: [a.record, ...s.exams].slice(0, MAX_EXAMS) }
    case 'code': {
      const cur = s.code[a.id] ?? { src: '', solved: false }
      return { ...s, code: { ...s.code, [a.id]: { src: a.src ?? cur.src, solved: cur.solved || !!a.solved } } }
    }
    case 'prefs':
      return { ...s, prefs: { ...s.prefs, ...a.prefs } }
    case 'reset':
      return { ...emptyProgress(), prefs: s.prefs, notes: s.notes }
  }
}

export function lessonStatus(p: ProgressData, id: string): LessonStatus {
  return p.lessons[id]?.status ?? 'not-started'
}

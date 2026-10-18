import type { Lecture, Lesson } from './types'
import { getLang, type Lang } from '../i18n/lang'
import { lecture1 } from './lecture1'
import { lecture2 } from './lecture2'
import { lecture3 } from './lecture3'
import { lecture4 } from './lecture4'
import { lecture5 } from './lecture5'
import { lecture6 } from './lecture6'
import { lecture7 } from './lecture7'
import { lecture1 as en1 } from './en/lecture1'
import { lecture2 as en2 } from './en/lecture2'
import { lecture3 as en3 } from './en/lecture3'
import { lecture4 as en4 } from './en/lecture4'
import { lecture5 as en5 } from './en/lecture5'
import { lecture6 as en6 } from './en/lecture6'
import { lecture7 as en7 } from './en/lecture7'

/**
 * Lectures 1–7 of CS161 Winter 2026, in course order, per language. Lecture 8 (Hashing) is
 * intentionally out of scope. The English files mirror the Turkish ones structurally
 * (same ids, answers and visualizers) — `content.test.ts` enforces this.
 */
export const LECTURES_BY_LANG: Record<Lang, Lecture[]> = {
  tr: [lecture1, lecture2, lecture3, lecture4, lecture5, lecture6, lecture7],
  en: [en1, en2, en3, en4, en5, en6, en7],
}

const LESSONS_BY_LANG: Record<Lang, Lesson[]> = {
  tr: LECTURES_BY_LANG.tr.flatMap((l) => l.lessons),
  en: LECTURES_BY_LANG.en.flatMap((l) => l.lessons),
}

export const lectures = (): Lecture[] => LECTURES_BY_LANG[getLang()]

export const allLessons = (): Lesson[] => LESSONS_BY_LANG[getLang()]

export function findLesson(id: string): { lesson: Lesson; lecture: Lecture; index: number } | null {
  const all = allLessons()
  const index = all.findIndex((l) => l.id === id)
  if (index < 0) return null
  const lesson = all[index]
  return { lesson, lecture: lectures().find((l) => l.n === lesson.lecture)!, index }
}

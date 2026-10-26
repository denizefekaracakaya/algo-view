import type { Lecture, Lesson } from './types'
import { getLang, type Lang } from '../i18n/lang'
import { lecture1 } from './lecture1'
import { lecture2 } from './lecture2'
import { lecture3 } from './lecture3'
import { lecture4 } from './lecture4'
import { lecture5 } from './lecture5'
import { lecture6 } from './lecture6'
import { lecture7 } from './lecture7'
import { lecture8 } from './lecture8'
import { lecture9 } from './lecture9'
import { lecture10 } from './lecture10'
import { lecture11 } from './lecture11'
import { lecture12 } from './lecture12'
import { lecture13 } from './lecture13'
import { lecture14 } from './lecture14'
import { lecture15 } from './lecture15'
import { lecture16 } from './lecture16'
import { lecture17 } from './lecture17'
import { lecture1 as en1 } from './en/lecture1'
import { lecture2 as en2 } from './en/lecture2'
import { lecture3 as en3 } from './en/lecture3'
import { lecture4 as en4 } from './en/lecture4'
import { lecture5 as en5 } from './en/lecture5'
import { lecture6 as en6 } from './en/lecture6'
import { lecture7 as en7 } from './en/lecture7'
import { lecture8 as en8 } from './en/lecture8'
import { lecture9 as en9 } from './en/lecture9'
import { lecture10 as en10 } from './en/lecture10'
import { lecture11 as en11 } from './en/lecture11'
import { lecture12 as en12 } from './en/lecture12'
import { lecture13 as en13 } from './en/lecture13'
import { lecture14 as en14 } from './en/lecture14'
import { lecture15 as en15 } from './en/lecture15'
import { lecture16 as en16 } from './en/lecture16'
import { lecture17 as en17 } from './en/lecture17'

/**
 * Lectures 1–7 of CS161 Winter 2026, in course order, per language. Lecture 8 (Hashing) is
 * intentionally out of scope. The English files mirror the Turkish ones structurally
 * (same ids, answers and visualizers) — `content.test.ts` enforces this.
 */
export const LECTURES_BY_LANG: Record<Lang, Lecture[]> = {
  tr: [lecture1, lecture2, lecture3, lecture4, lecture5, lecture6, lecture7, lecture8, lecture9, lecture10, lecture11, lecture12, lecture13, lecture14, lecture15, lecture16, lecture17],
  en: [en1, en2, en3, en4, en5, en6, en7, en8, en9, en10, en11, en12, en13, en14, en15, en16, en17],
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

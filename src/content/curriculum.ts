import type { Lecture, Lesson } from './types'
import { lecture1 } from './lecture1'
import { lecture2 } from './lecture2'
import { lecture3 } from './lecture3'
import { lecture4 } from './lecture4'
import { lecture5 } from './lecture5'
import { lecture6 } from './lecture6'
import { lecture7 } from './lecture7'

/** Lectures 1–7 of CS161 Winter 2026, in course order. Lecture 8 (Hashing) is intentionally out of scope. */
export const LECTURES: Lecture[] = [lecture1, lecture2, lecture3, lecture4, lecture5, lecture6, lecture7]

export const ALL_LESSONS: Lesson[] = LECTURES.flatMap((l) => l.lessons)

export function findLesson(id: string): { lesson: Lesson; lecture: Lecture; index: number } | null {
  const index = ALL_LESSONS.findIndex((l) => l.id === id)
  if (index < 0) return null
  const lesson = ALL_LESSONS[index]
  return { lesson, lecture: LECTURES.find((l) => l.n === lesson.lecture)!, index }
}

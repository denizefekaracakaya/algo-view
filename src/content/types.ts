/** Lesson content model. Text fields use the small markup understood by <Rich>. */

export type QuestionKind = 'mcq' | 'order' | 'numeric'

interface QBase {
  id: string
  prompt: string
  hint: string
  explanation: string
}

export interface MCQ extends QBase {
  kind: 'mcq'
  options: string[]
  answer: number
  /** Optional per-option feedback for wrong choices. */
  feedback?: Partial<Record<number, string>>
}

export interface OrderQ extends QBase {
  kind: 'order'
  /** Items in the CORRECT order; the UI shuffles them deterministically. */
  items: string[]
}

export interface NumericQ extends QBase {
  kind: 'numeric'
  answer: number
  tolerance?: number
}

export type Question = MCQ | OrderQ | NumericQ

export interface Practice {
  id: string
  prompt: string
  hints: string[]
  solution: string
}

export type SourceKind = 'notes' | 'slides' | 'pre' | 'notebook' | 'concept' | 'homework' | 'section' | 'reading' | 'page'

export interface SourceRef {
  label: string
  labelEn: string
  url: string
  kind: SourceKind
}

export type SectionKind =
  | 'intuition'
  | 'formal'
  | 'viz'
  | 'steps'
  | 'pseudocode'
  | 'correctness'
  | 'complexity'
  | 'mistakes'
  | 'text'

export interface Section {
  kind: SectionKind
  title: string
  /** Markup text (optional for pure visualization sections). */
  body?: string
  /** Visualization key registered in src/viz/registry.tsx. */
  viz?: string
  /** For formal statements: rendered as a highlighted box. */
  box?: 'formal' | 'warn' | 'info'
  /** Pseudocode lines (for kind 'pseudocode'). */
  code?: string[]
  /** For proofs: steps revealed one by one. */
  proof?: { title: string; body: string }[]
  /** Ungraded “try it yourself” questions shown right after this section. */
  check?: Question[]
  /** Guided tasks shown before the visualizer (“try this, predict that”). */
  tasks?: string[]
  /** Marks content as intuitive vs. formal so the two are never confused. */
  label?: 'intuition' | 'formal' | 'proofIdea' | 'formalProof'
}

export interface Lesson {
  id: string
  lecture: number
  title: string
  titleEn: string
  summary: string
  minutes: number
  objectives: string[]
  prerequisites: string[]
  sections: Section[]
  quiz: Question[]
  practice: Practice[]
  sources: SourceRef[]
}

export interface Lecture {
  n: number
  title: string
  titleEn: string
  date: string
  blurb: string
  lessons: Lesson[]
}

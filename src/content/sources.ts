import type { SourceRef } from './types'

/** Official Stanford CS161 Winter 2026 public resources used for this release (links only; nothing is mirrored). */
const SITE = 'https://stanford-cs161.github.io/winter2026'
const F = `${SITE}/assets/files`
const BANK = 'https://stanford-cs161.github.io/winter2025-bank'
const COLAB = 'http://colab.research.google.com/github/stanford-cs161/winter2025-extra/blob/colab'

export const COURSE = {
  lectures: `${SITE}/lectures/`,
  homework: `${SITE}/homework/`,
  schedule: `${SITE}/schedule/`,
  sections: `${SITE}/sections/`,
}

const s = (label: string, url: string, kind: SourceRef['kind']): SourceRef => ({ label, url, kind })

export const SRC = {
  l1: {
    notes: s('Ders 1 notları (PDF)', `${F}/lecture1-notes.pdf`, 'notes'),
    slides: s('Ders 1 slaytları (PDF)', `${F}/Lecture1.pdf`, 'slides'),
    notebook: s('Ders 1 Python not defteri: Karatsuba (Colab)', `${COLAB}/lecture1_karatsuba.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Multiplication (PDF)', `${BANK}/multiplication.pdf`, 'concept'),
  },
  l2: {
    pre: s('Ders 2 ön alıştırma (PDF)', `${F}/lecture2-pre.pdf`, 'pre'),
    notes: s('Ders 2 notları (PDF)', `${F}/lecture2-notes.pdf`, 'notes'),
    slides: s('Ders 2 slaytları (PDF)', `${F}/Lecture2.pdf`, 'slides'),
    proof: s('InsertionSort doğruluk kanıtı (PDF)', `${F}/CS161Lecture02_handout.pdf`, 'notes'),
    notebook: s('Ders 2 Python not defteri: sorting (Colab)', `${COLAB}/lecture2_sorting.ipynb`, 'notebook'),
    conceptAsym: s('Kavram kontrolü: Asymptotics (PDF)', `${BANK}/asymptotics.pdf`, 'concept'),
    conceptSort: s('Kavram kontrolü: Sorting (PDF)', `${BANK}/sorting.pdf`, 'concept'),
  },
  l3: {
    pre: s('Ders 3 ön alıştırma (PDF)', `${F}/lecture3-pre.pdf`, 'pre'),
    notes: s('Ders 3 notları (PDF)', `${F}/lecture3-notes.pdf`, 'notes'),
    slides: s('Ders 3 slaytları (PDF)', `${F}/lecture3-slides.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Recurrence Relations (PDF)', `${BANK}/recurrence.pdf`, 'concept'),
  },
  l4: {
    pre: s('Ders 4 ön alıştırma (PDF)', `${F}/lecture4-pre.pdf`, 'pre'),
    notes: s('Ders 4 notları (PDF)', `${F}/lecture4-notes.pdf`, 'notes'),
    slides: s('Ders 4 slaytları (PDF)', `${F}/lecture4-slides.pdf`, 'slides'),
    notebook: s('Ders 4 Python not defteri: select (Colab)', `${COLAB}/lecture4_select.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Selection (PDF)', `${BANK}/select.pdf`, 'concept'),
  },
  l5: {
    pre: s('Ders 5 ön alıştırma (PDF)', `${F}/lecture5-pre.pdf`, 'pre'),
    notes: s('Ders 5 notları (PDF)', `${F}/lecture5-notes.pdf`, 'notes'),
    slides: s('Ders 5 slaytları (PDF)', `${F}/lecture5-slides.pdf`, 'slides'),
    notebook: s('Ders 5 Python not defteri: quicksort (Colab)', `${COLAB}/lecture5_quicksort.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Randomized Algorithms (PDF)', `${BANK}/random.pdf`, 'concept'),
  },
  l6: {
    pre: s('Ders 6 ön alıştırma (PDF)', `${F}/lecture6-pre.pdf`, 'pre'),
    notes: s('Ders 6 notları (PDF)', `${F}/lecture6-notes.pdf`, 'notes'),
    slides: s('Ders 6 slaytları (PDF)', `${F}/lecture6-slides.pdf`, 'slides'),
    notebook: s('Ders 6 Python not defteri: bucketsort (Colab)', `${COLAB}/lecture6_bucketsort.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Sorting Models (PDF)', `${BANK}/sortingmodels.pdf`, 'concept'),
    blum: s('Ek okuma: Avrim Blum — sıralama alt sınırları (PDF)', 'http://www.cs.cmu.edu/~avrim/451f11/lectures/lect0913.pdf', 'reading'),
  },
  l7: {
    pre: s('Ders 7 ön alıştırma (PDF)', `${F}/lecture7-pre.pdf`, 'pre'),
    notes: s('Ders 7 notları (PDF)', `${F}/lecture7-notes.pdf`, 'notes'),
    slides: s('Ders 7 slaytları (PDF)', `${F}/lecture7-slides.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Binary Search Trees (PDF)', `${BANK}/bst.pdf`, 'concept'),
  },
  hw: {
    hw1: s('Ödev 1 (PDF)', `${F}/HW1.pdf`, 'homework'),
    hw2: s('Ödev 2 (PDF)', `${F}/HW2.pdf`, 'homework'),
    hw3: s('Ödev 3 (PDF)', `${F}/HW3.pdf`, 'homework'),
    hw4: s('Ödev 4 (PDF)', `${F}/HW4.pdf`, 'homework'),
  },
  sec: {
    s1: s('Section 1 (PDF)', `${F}/Section1.pdf`, 'section'),
    s2: s('Section 2 (PDF)', `${F}/Section2.pdf`, 'section'),
    s3: s('Section 3 (PDF)', `${F}/Section3.pdf`, 'section'),
    s4: s('Section 4 (PDF)', `${F}/section4_questions.pdf`, 'section'),
  },
  pages: {
    lectures: s('CS161 Ders sayfası', COURSE.lectures, 'page'),
  },
} as const

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

const s = (label: string, labelEn: string, url: string, kind: SourceRef['kind']): SourceRef => ({ label, labelEn, url, kind })

export const SRC = {
  l1: {
    notes: s('Ders 1 notları (PDF)', 'Lecture 1 notes (PDF)', `${F}/lecture1-notes.pdf`, 'notes'),
    slides: s('Ders 1 slaytları (PDF)', 'Lecture 1 slides (PDF)', `${F}/Lecture1.pdf`, 'slides'),
    notebook: s('Ders 1 Python not defteri: Karatsuba (Colab)', 'Lecture 1 Python notebook: Karatsuba (Colab)', `${COLAB}/lecture1_karatsuba.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Multiplication (PDF)', 'Concept check: Multiplication (PDF)', `${BANK}/multiplication.pdf`, 'concept'),
  },
  l2: {
    pre: s('Ders 2 ön alıştırma (PDF)', 'Lecture 2 pre-lecture exercise (PDF)', `${F}/lecture2-pre.pdf`, 'pre'),
    notes: s('Ders 2 notları (PDF)', 'Lecture 2 notes (PDF)', `${F}/lecture2-notes.pdf`, 'notes'),
    slides: s('Ders 2 slaytları (PDF)', 'Lecture 2 slides (PDF)', `${F}/Lecture2.pdf`, 'slides'),
    proof: s('InsertionSort doğruluk kanıtı (PDF)', 'Proof that InsertionSort is correct (PDF)', `${F}/CS161Lecture02_handout.pdf`, 'notes'),
    notebook: s('Ders 2 Python not defteri: sorting (Colab)', 'Lecture 2 Python notebook: sorting (Colab)', `${COLAB}/lecture2_sorting.ipynb`, 'notebook'),
    conceptAsym: s('Kavram kontrolü: Asymptotics (PDF)', 'Concept check: Asymptotics (PDF)', `${BANK}/asymptotics.pdf`, 'concept'),
    conceptSort: s('Kavram kontrolü: Sorting (PDF)', 'Concept check: Sorting (PDF)', `${BANK}/sorting.pdf`, 'concept'),
  },
  l3: {
    pre: s('Ders 3 ön alıştırma (PDF)', 'Lecture 3 pre-lecture exercise (PDF)', `${F}/lecture3-pre.pdf`, 'pre'),
    notes: s('Ders 3 notları (PDF)', 'Lecture 3 notes (PDF)', `${F}/lecture3-notes.pdf`, 'notes'),
    slides: s('Ders 3 slaytları (PDF)', 'Lecture 3 slides (PDF)', `${F}/lecture3-slides.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Recurrence Relations (PDF)', 'Concept check: Recurrence Relations (PDF)', `${BANK}/recurrence.pdf`, 'concept'),
  },
  l4: {
    pre: s('Ders 4 ön alıştırma (PDF)', 'Lecture 4 pre-lecture exercise (PDF)', `${F}/lecture4-pre.pdf`, 'pre'),
    notes: s('Ders 4 notları (PDF)', 'Lecture 4 notes (PDF)', `${F}/lecture4-notes.pdf`, 'notes'),
    slides: s('Ders 4 slaytları (PDF)', 'Lecture 4 slides (PDF)', `${F}/lecture4-slides.pdf`, 'slides'),
    notebook: s('Ders 4 Python not defteri: select (Colab)', 'Lecture 4 Python notebook: select (Colab)', `${COLAB}/lecture4_select.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Selection (PDF)', 'Concept check: Selection (PDF)', `${BANK}/select.pdf`, 'concept'),
  },
  l5: {
    pre: s('Ders 5 ön alıştırma (PDF)', 'Lecture 5 pre-lecture exercise (PDF)', `${F}/lecture5-pre.pdf`, 'pre'),
    notes: s('Ders 5 notları (PDF)', 'Lecture 5 notes (PDF)', `${F}/lecture5-notes.pdf`, 'notes'),
    slides: s('Ders 5 slaytları (PDF)', 'Lecture 5 slides (PDF)', `${F}/lecture5-slides.pdf`, 'slides'),
    notebook: s('Ders 5 Python not defteri: quicksort (Colab)', 'Lecture 5 Python notebook: quicksort (Colab)', `${COLAB}/lecture5_quicksort.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Randomized Algorithms (PDF)', 'Concept check: Randomized Algorithms (PDF)', `${BANK}/random.pdf`, 'concept'),
  },
  l6: {
    pre: s('Ders 6 ön alıştırma (PDF)', 'Lecture 6 pre-lecture exercise (PDF)', `${F}/lecture6-pre.pdf`, 'pre'),
    notes: s('Ders 6 notları (PDF)', 'Lecture 6 notes (PDF)', `${F}/lecture6-notes.pdf`, 'notes'),
    slides: s('Ders 6 slaytları (PDF)', 'Lecture 6 slides (PDF)', `${F}/lecture6-slides.pdf`, 'slides'),
    notebook: s('Ders 6 Python not defteri: bucketsort (Colab)', 'Lecture 6 Python notebook: bucketsort (Colab)', `${COLAB}/lecture6_bucketsort.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Sorting Models (PDF)', 'Concept check: Sorting Models (PDF)', `${BANK}/sortingmodels.pdf`, 'concept'),
    blum: s('Ek okuma: Avrim Blum — sıralama alt sınırları (PDF)', 'Further reading: Avrim Blum — sorting lower bounds (PDF)', 'http://www.cs.cmu.edu/~avrim/451f11/lectures/lect0913.pdf', 'reading'),
  },
  l7: {
    pre: s('Ders 7 ön alıştırma (PDF)', 'Lecture 7 pre-lecture exercise (PDF)', `${F}/lecture7-pre.pdf`, 'pre'),
    notes: s('Ders 7 notları (PDF)', 'Lecture 7 notes (PDF)', `${F}/lecture7-notes.pdf`, 'notes'),
    slides: s('Ders 7 slaytları (PDF)', 'Lecture 7 slides (PDF)', `${F}/lecture7-slides.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Binary Search Trees (PDF)', 'Concept check: Binary Search Trees (PDF)', `${BANK}/bst.pdf`, 'concept'),
  },
  hw: {
    hw1: s('Ödev 1 (PDF)', 'Homework 1 (PDF)', `${F}/HW1.pdf`, 'homework'),
    hw2: s('Ödev 2 (PDF)', 'Homework 2 (PDF)', `${F}/HW2.pdf`, 'homework'),
    hw3: s('Ödev 3 (PDF)', 'Homework 3 (PDF)', `${F}/HW3.pdf`, 'homework'),
    hw4: s('Ödev 4 (PDF)', 'Homework 4 (PDF)', `${F}/HW4.pdf`, 'homework'),
  },
  sec: {
    s1: s('Section 1 (PDF)', 'Section 1 (PDF)', `${F}/Section1.pdf`, 'section'),
    s2: s('Section 2 (PDF)', 'Section 2 (PDF)', `${F}/Section2.pdf`, 'section'),
    s3: s('Section 3 (PDF)', 'Section 3 (PDF)', `${F}/Section3.pdf`, 'section'),
    s4: s('Section 4 (PDF)', 'Section 4 (PDF)', `${F}/section4_questions.pdf`, 'section'),
  },
  l8: {
    pre: s('Ders 8 ön alıştırma (PDF)', 'Lecture 8 pre-lecture exercise (PDF)', `${F}/lecture8-pre.pdf`, 'pre'),
    notes: s('Ders 8 notları (PDF)', 'Lecture 8 notes (PDF)', `${F}/lecture8-notes.pdf`, 'notes'),
    slides: s('Ders 8 slaytları (PDF)', 'Lecture 8 slides (PDF)', `${F}/Lecture8.pdf`, 'slides'),
    notebook: s('Ders 8 Python not defteri: hashing (Colab)', 'Lecture 8 Python notebook: hashing (Colab)', `${COLAB}/lecture8_hashing.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Hashing (PDF)', 'Concept check: Hashing (PDF)', `${BANK}/hashing.pdf`, 'concept'),
  },
  l9: {
    pre: s('Ders 9 ön alıştırma (PDF)', 'Lecture 9 pre-lecture exercise (PDF)', `${F}/lecture9-pre.pdf`, 'pre'),
    notes: s('Ders 9 notları (PDF)', 'Lecture 9 notes (PDF)', `${F}/lecture9-notes.pdf`, 'notes'),
    slides: s('Ders 9 slaytları (PDF)', 'Lecture 9 slides (PDF)', `${F}/Lecture9.pdf`, 'slides'),
    notebook: s('Ders 9 Python not defteri: graphs (Colab)', 'Lecture 9 Python notebook: graphs (Colab)', `${COLAB}/lecture9_graphs.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: BFS/DFS (PDF)', 'Concept check: BFS/DFS (PDF)', `${BANK}/bfsdfs.pdf`, 'concept'),
  },
  l10: {
    pre: s('Ders 10 ön alıştırma (PDF)', 'Lecture 10 pre-lecture exercise (PDF)', `${F}/lecture10-pre.pdf`, 'pre'),
    notes: s('Ders 10 notları (PDF)', 'Lecture 10 notes (PDF)', `${F}/lecture10-notes.pdf`, 'notes'),
    slides: s('Ders 10 slaytları (PDF)', 'Lecture 10 slides (PDF)', `${F}/lecture10-slides.pdf`, 'slides'),
    notebook: s('Ders 10 Python not defteri: SCC (Colab)', 'Lecture 10 Python notebook: SCC (Colab)', `${COLAB}/lecture10_scc.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: SCC (PDF)', 'Concept check: SCC (PDF)', `${BANK}/scc.pdf`, 'concept'),
  },
  l11: {
    pre: s('Ders 11 ön alıştırma (PDF)', 'Lecture 11 pre-lecture exercise (PDF)', `${F}/lecture11-pre.pdf`, 'pre'),
    notes: s('Ders 11 notları (PDF)', 'Lecture 11 notes (PDF)', `${F}/lecture11-notes.pdf`, 'notes'),
    slides: s('Ders 11 slaytları (PDF)', 'Lecture 11 slides (PDF)', `${F}/lecture11-slides.pdf`, 'slides'),
    notebook: s('Ders 11 Python not defteri: Dijkstra (Colab)', 'Lecture 11 Python notebook: Dijkstra (Colab)', `${COLAB}/lecture11_dijkstra.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Dijkstra (PDF)', 'Concept check: Dijkstra (PDF)', `${BANK}/dijkstra.pdf`, 'concept'),
  },
  l12: {
    pre: s('Ders 12 ön alıştırma (PDF)', 'Lecture 12 pre-lecture exercise (PDF)', `${F}/lecture12-pre.pdf`, 'pre'),
    notes: s('Ders 12 notları (PDF)', 'Lecture 12 notes (PDF)', `${F}/lecture12-notes.pdf`, 'notes'),
    slides: s('Ders 12 slaytları (PDF)', 'Lecture 12 slides (PDF)', `${F}/Lecture12.pdf`, 'slides'),
    notebook: s('Ders 12 Python not defteri: DP (Colab)', 'Lecture 12 Python notebook: DP (Colab)', `${COLAB}/lecture12_dp.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Dynamic Programming 1 (PDF)', 'Concept check: Dynamic Programming 1 (PDF)', `${BANK}/dp1.pdf`, 'concept'),
  },
  l13: {
    notes: s('Ders 13 notları (PDF)', 'Lecture 13 notes (PDF)', `${F}/lecture13-notes.pdf`, 'notes'),
    slides: s('Ders 13 slaytları (PDF)', 'Lecture 13 slides (PDF)', `${F}/Lecture13.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Dynamic Programming 2 (PDF)', 'Concept check: Dynamic Programming 2 (PDF)', `${BANK}/dp2.pdf`, 'concept'),
  },
  l14: {
    pre: s('Ders 14 ön alıştırma (PDF)', 'Lecture 14 pre-lecture exercise (PDF)', `${F}/lecture14-pre.pdf`, 'pre'),
    notes: s('Ders 14 notları (PDF)', 'Lecture 14 notes (PDF)', `${F}/lecture14-notes.pdf`, 'notes'),
    slides: s('Ders 14 slaytları (PDF)', 'Lecture 14 slides (PDF)', `${F}/Lecture14.pdf`, 'slides'),
    notebook: s('Ders 14 Python not defteri: greedy (Colab)', 'Lecture 14 Python notebook: greedy (Colab)', `${COLAB}/lecture14_greedy.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: Greedy (PDF)', 'Concept check: Greedy (PDF)', `${BANK}/greedy.pdf`, 'concept'),
  },
  l15: {
    pre: s('Ders 15 ön alıştırma (PDF)', 'Lecture 15 pre-lecture exercise (PDF)', `${F}/lecture15-pre.pdf`, 'pre'),
    notes: s('Ders 15 notları (PDF)', 'Lecture 15 notes (PDF)', `${F}/lecture15-notes.pdf`, 'notes'),
    slides: s('Ders 15 slaytları (PDF)', 'Lecture 15 slides (PDF)', `${F}/lecture15-slides.pdf`, 'slides'),
    notebook: s('Ders 15 Python not defteri: MST (Colab)', 'Lecture 15 Python notebook: MST (Colab)', `${COLAB}/lecture15_mst.ipynb`, 'notebook'),
    concept: s('Kavram kontrolü: MST (PDF)', 'Concept check: MST (PDF)', `${BANK}/mst.pdf`, 'concept'),
  },
  l16: {
    pre: s('Ders 16 ön alıştırma (PDF)', 'Lecture 16 pre-lecture exercise (PDF)', `${F}/lecture16-pre.pdf`, 'pre'),
    notes: s('Ders 16 notları (PDF)', 'Lecture 16 notes (PDF)', `${F}/lecture16-notes.pdf`, 'notes'),
    slides: s('Ders 16 slaytları (PDF)', 'Lecture 16 slides (PDF)', `${F}/lecture16-slides.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Max Flow (PDF)', 'Concept check: Max Flow (PDF)', `${BANK}/maxflow.pdf`, 'concept'),
  },
  l17: {
    notes: s('Ders 17 notları (PDF)', 'Lecture 17 notes (PDF)', `${F}/lecture17-notes.pdf`, 'notes'),
    slides: s('Ders 17 slaytları (PDF)', 'Lecture 17 slides (PDF)', `${F}/Lecture17.pdf`, 'slides'),
    concept: s('Kavram kontrolü: Stable Matching (PDF)', 'Concept check: Stable Matching (PDF)', `${BANK}/stablematching.pdf`, 'concept'),
  },
  l18: {
    slides: s('Ders 18 slaytları: What’s next? (PDF)', 'Lecture 18 slides: What’s next? (PDF)', `${F}/Lecture18.pdf`, 'slides'),
  },
  pages: {
    lectures: s('CS161 Ders sayfası', 'CS161 lectures page', COURSE.lectures, 'page'),
  },
} as const

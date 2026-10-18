import type { Lecture } from '../types'
import { SRC } from '../sources'

export const lecture1: Lecture = {
  n: 1,
  title: 'Why are you here?',
  titleEn: 'Why are you here?',
  date: 'January 5, 2026',
  blurb: 'Why algorithms matter, how we measure running time, and the first divide-and-conquer surprise: Karatsuba multiplication.',
  lessons: [
    {
      id: 'l1-why',
      lecture: 1,
      title: 'Algorithms and how we measure running time',
      titleEn: 'Algorithms and how we measure running time',
      summary: 'What makes an algorithm “better”? Why do we measure growth rate instead of seconds?',
      minutes: 15,
      objectives: [
        'Explain why algorithm design and analysis show up in every area of computer science.',
        'Understand why we express running time by how it scales with the input size, not in milliseconds.',
        'See with a concrete example that constant factors cannot make up for a difference in exponents for large n.',
      ],
      prerequisites: ['Basic programming', 'Exponents and logarithms'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: why algorithms?',
          label: 'intuition',
          body: `The Lecture 1 notes give three reasons: algorithms are **fundamental** to computer science (operating systems, networking, machine learning, cryptography and computational biology all rest on algorithmic ideas), they are **useful** (as hardware gets faster, the gap between a fast and a slow algorithm _grows_), and they are **fun** (a mix of creativity and mathematical precision; the question “is there a better algorithm?” keeps producing surprises).

In this course we treat an algorithm not just as “code that runs” but as **an object about which two questions must be answered**:

- **Is it correct?** Does it produce the right output for every valid input?
- **Is it efficient?** How much work does it do as the input grows?`,
        },
        {
          kind: 'formal',
          title: 'How do we measure running time?',
          box: 'formal',
          label: 'formal',
          body: `Measuring running time in milliseconds measures not the algorithm but the triple **algorithm + implementation + hardware**. Grade-school multiplication is the same algorithm by hand and on a computer.

Instead we look at **how the work scales** with the input size $n$. When multiplying two $n$-digit numbers the grade-school way, every pair of digits is multiplied: $n^2$ one-digit multiplications. So the running time of the grade-school method “scales like $n^2$”. (We make this precise with Big-O in Lecture 2.)`,
        },
        {
          kind: 'viz',
          title: 'Interactive: constant factor or exponent?',
          viz: 'handVsComputer',
          body: `The thought experiment from the notes: working by hand is $10^4$ times slower than a computer. Run an algorithm that scales like $n^{1.6}$ by hand and one that scales like $n^2$ on the computer. Change the slowdown factor and the exponent with the sliders — where does the crossover move?`,
        },
        {
          kind: 'text',
          title: 'Why doesn’t precomputation help?',
          body: `A tempting “trick”: store every product of $n$-digit numbers in a table. As the notes point out, that is $10^{2n}$ inputs; for $n = 100$ that is $10^{200}$ rows — far beyond the number of atoms in the universe (about $10^{80}$). We really need a smarter **algorithm**.

**The word “algorithm”** comes from the name of al-Khwarizmi, who worked at the House of Wisdom in 9th-century Baghdad; his book on computing with Hindu–Arabic numerals brought the positional number system we use today to Europe. A good **data representation** (decimal instead of Roman numerals) makes multiplication easier — an early example of why the choice of data structure matters.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- “My computer is fast, the algorithm doesn’t matter.” — As hardware gets faster we want to solve bigger problems; the difference in growth rate is felt even more then.
- “I measured it once, algorithm X is faster.” — A single measurement belongs to one input and one machine; it is not a general claim about scaling.
- “Constant factors never matter.” — In practice they can; but the focus of this course is behavior for large $n$.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'How many pairs of digits are multiplied when two $n$-digit numbers are multiplied the grade-school way?',
          options: ['$2n - 1$', '$n^2$', '$n^3$', '$n \\log n$'],
          answer: 1,
          hint: 'Each digit of the first number is multiplied once by each digit of the second.',
          explanation: 'Each of the $n$ digits is multiplied by each of the other number’s $n$ digits: $n \\cdot n = n^2$ pairs.',
          feedback: { 0: '$2n-1$ is the number of “columns” in the result, not the number of pairs multiplied.', 2: 'Each pair is multiplied only once; there is no third dimension.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Why do we express running time by how it scales with input size rather than in milliseconds?',
          options: [
            'Milliseconds are impossible to measure.',
            'Scaling does not depend on the programming language, implementation or hardware.',
            'For large inputs all algorithms run equally fast.',
            'Because constant factors are always zero.',
          ],
          answer: 1,
          hint: 'Imagine running the same algorithm by hand and on a computer.',
          explanation: 'Milliseconds measure the machine and implementation along with the algorithm. Growth rate is a property of the algorithm itself.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Compare $10^4 \\cdot n^{1.6}$ with $n^2$. Which statement is true?',
          options: [
            'For every $n$, $10^4 n^{1.6} > n^2$.',
            'For large enough $n$, $10^4 n^{1.6} < n^2$.',
            'They are equal only at $n = 10^4$, and afterwards $10^4 n^{1.6}$ is larger again.',
            'They cannot be compared.',
          ],
          answer: 1,
          hint: '$n^2 / n^{1.6} = n^{0.4}$; does this ratio grow without bound?',
          explanation: '$n^{0.4} > 10^4 \\iff n > 10^{10}$. From that point on $n^2$ is always larger; a constant factor can only delay an exponent difference for a while.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `One algorithm takes $100\\,n\\log_2 n$ steps, another $n^2$. For values of the form $n = 2^k$, from which $n$ on is the first algorithm strictly faster? (Our own example; not from the lecture notes.)`,
          hints: ['$100 n \\log_2 n < n^2 \\iff 100 \\log_2 n < n$.', 'Substitute $n = 2^k$: what is the smallest $k$ with $100k < 2^k$?'],
          solution: `$100k < 2^k$: for $k = 9$, $900 > 512$; for $k = 10$, $1000 < 1024$. So from $n = 2^{10} = 1024$ on (among powers of 2) the first algorithm is faster. The threshold is real, but the asymptotic comparison says $n \\log n$ grows more slowly than $n^2$; exactly where they cross depends on the constants.`,
        },
      ],
      sources: [SRC.l1.notes, SRC.l1.slides, SRC.l1.concept],
    },
    {
      id: 'l1-karatsuba',
      lecture: 1,
      title: 'Divide and conquer: Karatsuba multiplication',
      titleEn: 'Divide and conquer: Karatsuba integer multiplication',
      summary: 'Three subproblems instead of four: a small algebraic observation, a big asymptotic win.',
      minutes: 30,
      objectives: [
        'Apply the divide-and-conquer paradigm to integer multiplication.',
        'See that Mult1, with four subproblems, is not asymptotically better than the grade-school method.',
        'Explain how Karatsuba gets by with three subproblems using $ad + bc = (a+b)(c+d) - ac - bd$, bringing the work down to $n^{\\log_2 3} \\approx n^{1.585}$.',
      ],
      prerequisites: ['Recursion', 'Logarithm rules: $a^{\\log_b n} = n^{\\log_b a}$'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition',
          label: 'intuition',
          body: `We can write $1234 \\times 5678$ as $\\big((12\\cdot 100) + 34\\big)\\big((56 \\cdot 100) + 78\\big)$. In general, if $x = 10^{n/2} a + b$ and $y = 10^{n/2} c + d$, then

$$x \\cdot y = 10^{n}\\,ac + 10^{n/2}(ad + bc) + bd.$$

That is **four** products of $n/2$-digit numbers ($ac, ad, bc, bd$) plus a few cheap additions. Surprisingly, this alone gains nothing. Karatsuba’s idea: we don’t actually need $ad$ and $bc$ separately — only their **sum**.`,
        },
        {
          kind: 'formal',
          title: 'Two algorithms',
          box: 'formal',
          label: 'formal',
          body: `**Mult1:** compute $ac, ad, bc, bd$ recursively. Counting only one-digit multiplications (the cost model in the notes), $T(n) = 4\\,T(n/2)$, $T(1) = 1$.

**Karatsuba:** compute $z_1 = ac$, $z_2 = bd$, $z_3 = (a+b)(c+d)$; then $ad + bc = z_3 - z_1 - z_2$. This gives $T(n) = 3\\,T(n/2)$.

Unrolling for $n = 2^s$:
$$T(n) = 3T(n/2) = 3^2 T(n/4) = \\dots = 3^s T(1) = 3^{\\log_2 n} = n^{\\log_2 3} \\approx n^{1.585}.$$
The same unrolling for Mult1 gives $4^{\\log_2 n} = n^2$ — the same as grade school.`,
        },
        {
          kind: 'viz',
          title: 'Visualization: the recursion tree',
          viz: 'karatsuba',
          body: `Enter your own numbers and compare the two algorithms. Each box in the tree is a recursive call; the leaves are one-digit multiplications. The counters and the chart below show how the number of operations grows with the number of digits.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode (based on Algorithm 2 in the Lecture 3 notes)',
          code: [
            'Karatsuba(x, y):',
            '    if x and y are 1-digit: return x·y',
            '    split x = 10^m·a + b,  y = 10^m·c + d',
            '    z1 = Karatsuba(a, c)',
            '    z2 = Karatsuba(b, d)',
            '    z3 = Karatsuba(a + b, c + d)',
            '    z4 = z3 − z1 − z2          # = ad + bc',
            '    return z1·10^(2m) + z4·10^m + z2',
          ],
        },
        {
          kind: 'correctness',
          title: 'Why is it correct?',
          label: 'proofIdea',
          body: `Algebraic identity: $(a+b)(c+d) = ac + ad + bc + bd$, so $z_3 - z_1 - z_2 = ad + bc$. Assuming the recursive calls multiply correctly (the inductive hypothesis), the returned value is exactly $10^{2m}ac + 10^m(ad+bc) + bd = xy$. The recursion terminates because the numbers in the subproblems get smaller and eventually reach one digit.`,
        },
        {
          kind: 'complexity',
          title: 'Complexity and assumptions',
          body: `- **Parameter:** $n$ = number of digits. **Cost model:** number of one-digit multiplications (additions are added as an $O(n)$ term in Lecture 3).
- **Mult1:** $n^2$ — no better than grade school. **Karatsuba:** $n^{\\log_2 3} \\approx n^{1.585}$.
- The analysis in the notes is deliberately “sloppy”: $(a+b)$ and $(c+d)$ may actually have $n/2 + 1$ digits, and the cost of additions was ignored. In Lecture 3 we solve $T(n) = 3T(n/2) + O(n)$ rigorously with the Master Theorem; the result is the same: $O(n^{\\log_2 3})$.
- History (from the notes): Toom–Cook $O(n^{1.465})$, Schönhage–Strassen $O(n \\log n \\log\\log n)$, Harvey–van der Hoeven (2019) $O(n \\log n)$.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- “Divide and conquer always speeds things up.” — Mult1 divides but is still $n^2$; the gain comes from reducing the **number** of subproblems.
- “Karatsuba does more additions, so it is slower.” — Additions are $O(n)$; asymptotically negligible next to the multiplications.
- Confusing $3^{\\log_2 n}$ with $n^3$: $3^{\\log_2 n} = n^{\\log_2 3}$, i.e. $n^{1.585}$.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'A divide-and-conquer algorithm makes $t$ sub-multiplications of $n/2$ digits in every call. How many one-digit multiplications does it make when $n = 2^s$?',
          options: ['$t \\cdot n$', '$t^{\\log_2 n} = n^{\\log_2 t}$', '$n^t$', '$2^t n$'],
          answer: 1,
          hint: 'Unroll the recurrence $T(n) = t\\,T(n/2)$ $s$ times.',
          explanation: '$T(n) = t^s T(1) = t^{\\log_2 n} = n^{\\log_2 t}$. For $t=4$ this is $n^2$, for $t=3$ it is $n^{1.585}$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'For which values of $t$ does the algorithm from the previous question make **fewer** one-digit multiplications than grade school ($n^2$) for very large $n$?',
          options: ['For every $t$', 'Only $t = 1, 2$', '$t = 1, 2, 3$', '$t = 1, 2, 3, 4$'],
          answer: 2,
          hint: '$n^{\\log_2 t} < n^2 \\iff \\log_2 t < 2$.',
          explanation: '$\\log_2 t < 2 \\iff t < 4$. $t = 4$ gives exactly $n^2$ (Mult1), no better.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'For $x = 1234$, $y = 5678$, what is $z_3 = (a+b)(c+d)$ at the first level of Karatsuba?',
          answer: 6164,
          hint: '$a = 12, b = 34, c = 56, d = 78$.',
          explanation: '$a + b = 46$, $c + d = 134$, $46 \\cdot 134 = 6164$. Check: $ac = 672$, $bd = 2652$, $6164 - 672 - 2652 = 2840 = ad + bc$.',
        },
        {
          id: 'q4',
          kind: 'order',
          prompt: 'Put the steps of one Karatsuba call in the right order.',
          items: [
            'Check the base case (one digit?)',
            'Split $x$ and $y$ into $a, b, c, d$',
            'Recursively compute $z_1 = ac$, $z_2 = bd$, $z_3 = (a+b)(c+d)$',
            '$ad + bc = z_3 - z_1 - z_2$',
            'Return $10^{2m}z_1 + 10^m(ad+bc) + z_2$',
          ],
          hint: 'First we decide whether to stop; combining comes last.',
          explanation: 'Base case → split → three recursive calls → middle term by subtraction → combine.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: run Karatsuba by hand on $x = 47$, $y = 83$. How many one-digit multiplications are made? How many does Mult1 need for the same product?`,
          hints: ['$a = 4, b = 7, c = 8, d = 3$.', '$a + b = 11$ and $c + d = 11$ have two digits; $z_3$ recurses once more.'],
          solution: `$z_1 = 4\\cdot 8 = 32$ (1 multiplication), $z_2 = 7 \\cdot 3 = 21$ (1 multiplication), $z_3 = 11 \\cdot 11$: this splits again ($1\\cdot1$, $1\\cdot1$, $2\\cdot2$ → 3 multiplications) and gives $121$. $ad + bc = 121 - 32 - 21 = 68$. The result is $3200 + 680 + 21 = 3901 = 47 \\cdot 83$. In total **5** one-digit multiplications; Mult1 makes **4**! On small inputs, and because of the “carry digit”, Karatsuba’s advantage may not show; the gain is asymptotic, for large $n$. (Try 47 × 83 in the visualizer.)`,
        },
      ],
      sources: [SRC.l1.notes, SRC.l1.slides, SRC.l1.notebook, SRC.l1.concept, SRC.l3.notes],
    },
  ],
}

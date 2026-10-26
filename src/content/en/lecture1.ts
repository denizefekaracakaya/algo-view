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
      minutes: 25,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'If computers became 1000 times faster, how much larger a problem could an $n^2$ algorithm solve **in the same time**?',
              options: ['1000 times larger', 'About 31.6 times larger', '10 times larger', '2 times larger'],
              answer: 1,
              hint: 'For which $c$ is $(cn)^2 = 1000\\,n^2$?',
              explanation: '$c^2 = 1000 \\Rightarrow c = \\sqrt{1000} \\approx 31.6$. Even with 1000× faster hardware, an $n^2$ algorithm only handles a ~32× larger problem; the growth rate of the algorithm matters more than the hardware.',
            },
          ],
          label: 'intuition',
          body: `The Lecture 1 notes give three reasons: algorithms are **fundamental** to computer science (operating systems, networking, machine learning, cryptography and computational biology all rest on algorithmic ideas), they are **useful** (as hardware gets faster, the gap between a fast and a slow algorithm _grows_), and they are **fun** (a mix of creativity and mathematical precision; the question “is there a better algorithm?” keeps producing surprises).

In this course we treat an algorithm not just as “code that runs” but as **an object about which two questions must be answered**:

- **Is it correct?** Does it produce the right output for every valid input?
- **Is it efficient?** How much work does it do as the input grows?`,
        },
        {
          kind: 'formal',
          title: 'How do we measure running time?',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'How many one-digit multiplications does grade-school multiplication of two 12-digit numbers make?',
              answer: 144,
              hint: 'Each pair of digits is multiplied once.',
              explanation: '$12 \\cdot 12 = 144$: $n^2$ for $n$ digits.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Measuring running time in milliseconds measures not the algorithm but the triple **algorithm + implementation + hardware**. Grade-school multiplication is the same algorithm by hand and on a computer.

Instead we look at **how the work scales** with the input size $n$. When multiplying two $n$-digit numbers the grade-school way, every pair of digits is multiplied: $n^2$ one-digit multiplications. So the running time of the grade-school method “scales like $n^2$”. (We make this precise with Big-O in Lecture 2.)`,
        },
        {
          kind: 'viz',
          title: 'Interactive: constant factor or exponent?',
          tasks: [
            'Set the slowdown to $10^4$ and the exponent to $1.6$ and read off the crossover. How many digits does it correspond to?',
            'Raise the exponent to $1.9$: where did the crossover move? Why such a big jump?',
            'Raise the slowdown to $10^8$ and set the exponent to $1.2$. When the constant factor grows, is there still a crossover?',
          ],
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'From which $n$ on does $10^4 \\cdot n^{1.6} < n^2$ hold?',
              options: ['$n > 10^4$', '$n > 10^{10}$', '$n > 10^{6.4}$', 'Never'],
              answer: 1,
              hint: '$n^{0.4} > 10^4$.',
              explanation: '$n^{0.4} > 10^4 \\iff n > 10^{4/0.4} = 10^{10}$.',
            },
          ],
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
          kind: 'text',
          title: 'In real life: why scaling matters',
          body: `Take a computer that does $10^9$ basic operations per second and process $n = 10^9$ records (say, the pages in a search engine’s index or the bases of a genome).

- $n\\log_2 n \\approx 3\\cdot 10^{10}$ operations: about **30 seconds**.
- $n^2 = 10^{18}$ operations: about $10^9$ seconds, i.e. **more than 31 years**.

Same machine, same data; the only difference is the growth rate of the algorithm. That is why every system working with large data (databases, search, route finding in map apps, cryptography) looks at how its algorithms scale first.

Multiplication is an everyday example too: the encryption in banking apps (RSA) constantly multiplies numbers with hundreds of digits. Languages such as Python switch from the grade-school method to Karatsuba once big integers are long enough — the topic of the next lesson.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'A computer doing $10^9$ operations per second runs an algorithm that makes $n^2$ operations, with $n = 10^6$. How many seconds does it take?',
              answer: 1000,
              hint: '$n^2 = 10^{12}$.',
              explanation: '$10^{12} / 10^9 = 1000$ seconds (about 17 minutes). An algorithm making $n\\log_2 n \\approx 2\\cdot 10^7$ operations finishes in 0.02 seconds.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: counting steps',
          label: 'formal',
          body: `Does an array contain a repeated element? The most direct way is to compare every pair: an outer loop $i = 0, \\dots, n-1$, an inner loop $j = i+1, \\dots, n-1$, and one comparison \`A[i] == A[j]\` per step. Without repeats the algorithm runs to the end; how many comparisons does it make in this worst case?`,
          proof: [
            { title: 'Inner loop', body: 'For a fixed $i$ the inner loop runs $n - 1 - i$ times: $n - 1$ times for $i = 0$, not at all for $i = n - 1$.' },
            { title: 'Total', body: '$\\sum_{i=0}^{n-1} (n-1-i) = (n-1) + (n-2) + \\dots + 1 + 0 = \\frac{n(n-1)}{2}$.' },
            { title: 'Growth', body: '$499\\,500$ comparisons for $n = 1000$. Doubling $n$ roughly quadruples the count: the time scales like $n^2$.' },
            { title: 'Doing better', body: 'Sorting first ($O(n\\log n)$, Lecture 2) and then comparing only neighbors adds $n - 1$ comparisons: $O(n\\log n)$ in total. With the hash tables of Lecture 8 the expected time drops to $O(n)$.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'How many comparisons does this algorithm make on an array of $n = 10$ elements without repeats?',
              answer: 45,
              hint: '$\\frac{n(n-1)}{2}$.',
              explanation: '$\\frac{10 \\cdot 9}{2} = 45$: $9 + 8 + \\dots + 1$.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Our own example: a program takes 2 seconds for $n = 1000$ and 16 seconds for $n = 2000$. If the time has the form $c \\cdot n^k$, what is $k$? How long do you expect it to take for $n = 4000$?`,
          hints: ['By what factor does the time grow when $n$ doubles?', '$2^k = 8$.'],
          solution: `The time grew by a factor $16 / 2 = 8$ and $2^k = 8$, so $k = 3$: the algorithm behaves cubically. For $n = 4000$ another factor of 8: about $128$ seconds. This “doubling experiment” is a practical way to estimate the exponent from measurements; the constant $c$ never enters the calculation.`,
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
      minutes: 45,
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
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'For $y = 5678$ ($n = 4$) we write $y = 10^{2} c + d$. What is $c + d$?',
              answer: 134,
              hint: '$c = 56$, $d = 78$.',
              explanation: '$5678 = 56 \\cdot 100 + 78$; $c + d = 134$. Karatsuba’s third product $(a+b)(c+d)$ uses exactly these sums.',
            },
          ],
          label: 'intuition',
          body: `We can write $1234 \\times 5678$ as $\\big((12\\cdot 100) + 34\\big)\\big((56 \\cdot 100) + 78\\big)$. In general, if $x = 10^{n/2} a + b$ and $y = 10^{n/2} c + d$, then

$$x \\cdot y = 10^{n}\\,ac + 10^{n/2}(ad + bc) + bd.$$

That is **four** products of $n/2$-digit numbers ($ac, ad, bc, bd$) plus a few cheap additions. Surprisingly, this alone gains nothing. Karatsuba’s idea: we don’t actually need $ad$ and $bc$ separately — only their **sum**.`,
        },
        {
          kind: 'formal',
          title: 'Two algorithms',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'For $T(n) = 3T(n/2)$, $T(1) = 1$, what is $T(8)$? (The number of one-digit multiplications Karatsuba makes on 8-digit numbers, in the ideal case.)',
              answer: 27,
              hint: '$8 = 2^3$: three levels of unrolling.',
              explanation: '$T(8) = 3^3 = 27$. Mult1 makes $4^3 = 64$, grade school $8^2 = 64$.',
            },
          ],
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
          tasks: [
            'Run 1234 × 5678 first with **Mult1**, then with **Karatsuba**; compare the one-digit multiplication counters.',
            'Try 99 × 99. Why does $z_3 = (a+b)(c+d)$ itself have to be split again?',
            'On the chart, read the Mult1 and Karatsuba points at $n = 64$. How many times larger is one than the other? What did the theory predict?',
          ],
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
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'What is $z_3 - z_1 - z_2$ equal to?',
              options: ['$ad + bc$', '$ac + bd$', '$(a+b)(c+d)$', '$ad - bc$'],
              answer: 0,
              hint: 'Expand $(a+b)(c+d)$.',
              explanation: '$(a+b)(c+d) = ac + ad + bc + bd$; removing $ac$ and $bd$ leaves $ad + bc$.',
            },
          ],
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
          kind: 'text',
          title: 'In practice: which method do libraries use?',
          body: `An asymptotically better algorithm can be slower on small inputs: Karatsuba carries extra additions, subtractions and recursion overhead on every level. So real libraries work as **hybrids**:

- **CPython** switches to Karatsuba when multiplying big integers that are long enough (internally, beyond a few dozen “digits”); for small numbers it uses the grade-school method.
- High-performance libraries such as **GMP** move by size from grade school → Karatsuba → Toom-Cook → FFT-based (Schönhage–Strassen style) methods.
- The same idea exists for matrices: **Strassen** multiplies two $n\\times n$ matrices with **7** sub-products instead of 8: $T(n) = 7T(n/2) + O(n^2) = O(n^{\\log_2 7}) \\approx O(n^{2.81})$.

The Master Theorem in Lecture 3 lets us compute such “fewer subproblems” gains in one line.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Why do libraries fall back to the grade-school method for small numbers?',
              options: [
                'Karatsuba gives wrong results on small numbers.',
                'On small inputs Karatsuba’s extra additions and recursion overhead cost more than the multiplications it saves.',
                'The grade-school method is asymptotically faster.',
                'Karatsuba only works on numbers whose length is a power of 2.',
              ],
              answer: 1,
              hint: 'Asymptotic analysis ignores constant factors.',
              explanation: 'The gain is for large $n$; for small $n$ constant factors and overhead dominate. So below some threshold the simple method is used.',
            },
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'In Strassen’s recurrence $T(n) = 7T(n/2) + O(n^2)$, what is the exponent $\\log_2 7$, approximately? (Two decimals.)',
              answer: 2.81,
              tolerance: 0.01,
              hint: '$2^{2.8} \\approx 6.96$.',
              explanation: '$\\log_2 7 \\approx 2.807$, i.e. $O(n^{2.81})$ — asymptotically faster than the standard $n^3$ method.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: the real count and carries',
          label: 'formal',
          body: `On paper Karatsuba makes exactly $3^s$ one-digit multiplications for $n = 2^s$ digits. Real numbers add a small wrinkle: the sums $a + b$ and $c + d$ can have **one extra digit**. Let us count with the same rule as the visualizer’s counter.`,
          proof: [
            { title: 'Without carries', body: '$x = y = 11111111$ (8 digits): at every level $a + b$ keeps the same length ($1111 + 1111 = 2222$). The count is exactly $3^3 = 27$; the grade-school method needs $8^2 = 64$.' },
            { title: 'With carries', body: '$x = y = 99999999$: $9999 + 9999 = 19998$, five digits. The $z_3$ subproblem grows a little and the count rises to 63: just one below 64.' },
            { title: 'Larger inputs', body: 'For the same “all 9s” inputs: 197 against 256 at 16 digits, 601 against 1024 at 32 digits, 1815 against 4096 at 64 digits. Each doubling multiplies the ratio by about $3/4$: $n^{\\log_2 3} / n^2$.' },
            { title: 'The lesson', body: 'Carries only affect the constant factor; $T(n) \\le 3T(n/2 + 1) + O(n)$ still gives $O(n^{\\log_2 3})$. But for small $n$ the gain is negligible: libraries switch to Karatsuba only after a few dozen machine words.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'How many one-digit multiplications does Karatsuba make for $x = y = 11111111$?',
              answer: 27,
              hint: '8 = 2³ digits, no carries.',
              explanation: 'Three levels with 3 subproducts each: $3^3 = 27$.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Our own example: Karatsuba’s trick goes back to Gauss. Multiplying complex numbers, $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$, takes four real multiplications. Do it with **three**, and try it on $(3 + 2i)(1 + 4i)$.`,
          hints: ['Compute $ac$ and $bd$, plus $(a + b)(c + d)$.', '$(a + b)(c + d) = ac + ad + bc + bd$.'],
          solution: `$p_1 = ac$, $p_2 = bd$, $p_3 = (a + b)(c + d)$. The real part is $p_1 - p_2$, the imaginary part $p_3 - p_1 - p_2 = ad + bc$. Example: $p_1 = 3 \\cdot 1 = 3$, $p_2 = 2 \\cdot 4 = 8$, $p_3 = 5 \\cdot 5 = 25$. Result $(3 - 8) + (25 - 3 - 8)i = -5 + 14i$. Directly: $3 + 12i + 2i + 8i^2 = -5 + 14i$. A few additions instead of one multiplication: exactly the idea behind $z_3$ in Karatsuba.`,
        },
      ],
      sources: [SRC.l1.notes, SRC.l1.slides, SRC.l1.notebook, SRC.l1.concept, SRC.l3.notes],
    },
  ],
}

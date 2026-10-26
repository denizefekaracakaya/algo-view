import type { Lecture } from '../types'
import { SRC } from '../sources'
import { ACTIVITY_CODE, HUFFMAN_CODE } from '../../engines/greedy'

export const lecture14: Lecture = {
  n: 14,
  title: 'Greedy Algorithms',
  titleEn: 'Greedy Algorithms',
  date: 'February 25, 2026',
  blurb: 'Making the locally best choice at every step — and proving it optimal with an “exchange” argument.',
  lessons: [
    {
      id: 'l14-greedy',
      lecture: 14,
      title: 'The greedy choice: activity selection and scheduling',
      titleEn: 'The greedy choice: activity selection and scheduling',
      summary: 'Looking at a single subproblem; the earliest-finishing activity and the $l/w$ ratio.',
      minutes: 45,
      objectives: [
        'See a greedy algorithm as a refinement of dynamic programming: only one subproblem at each step.',
        'Prove with an exchange argument that the earliest-finishing activity is in some optimal solution.',
        'Show why ordering jobs by the ratio $l_j / w_j$ minimizes the weighted completion time.',
        'Show with examples when greedy rules fail.',
      ],
      prerequisites: ['Dynamic programming (Lectures 12–13)', 'Sorting'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: make a choice and never look back',
          label: 'intuition',
          body: `In dynamic programming the answer to a subproblem was found by looking at **many** smaller subproblems. Sometimes we notice that an optimal solution depends on just **one** subproblem: if we make the choice that looks best right now, what remains is a single subproblem. That is a **greedy** algorithm: fast and simple.

The catch: greedy algorithms are often **not** optimal (like the ratio rule for knapsack). The standard way to show one is correct is an **exchange argument**: show that any optimal solution can be changed, without making it worse, so that it contains the greedy choice.`,
        },
        {
          kind: 'formal',
          title: 'The activity selection problem',
          box: 'formal',
          label: 'formal',
          body: `There are $n$ activities; $a_i$ starts at $s_i$ and finishes at $f_i$. We cannot attend two at once. We want to choose **as many non-conflicting activities as possible** (like scheduling jobs on a single machine).

The DP approach: $S_{i,j}$ = the activities that start after $a_i$ finishes and end before $a_j$ starts. If the optimal set contains $a_k$, then $|A_{i,j}| = 1 + |A_{i,k}| + |A_{k,j}|$. That means a table of $n^2$ cells and $O(n^3)$ time.

**Proposition 1:** for every $S_{i,j}$ there is an optimal solution containing the activity $a_k$ of $S_{i,j}$ that **finishes first**. Then $A_{i,k}$ is empty (nothing finishes before it) and only $A_{k,j}$ remains: a single subproblem!`,
        },
        {
          kind: 'correctness',
          title: 'Proof of Proposition 1 (exchange argument)',
          label: 'formalProof',
          proof: [
            { title: 'Setup', body: '$a_k$: the activity of $S_{i,j}$ that finishes first. $A_{i,j}$: any optimal set; $a_\\ell$: the activity of $A_{i,j}$ that finishes first.' },
            { title: 'Exchange', body: '$A\' = A_{i,j} \\setminus \\{a_\\ell\\} \\cup \\{a_k\\}$. It has the same size: $|A\'| = |A_{i,j}|$.' },
            { title: 'Still conflict-free', body: '$a_k$ finishes first: $f_k \\le f_\\ell$. Every other $a_t$ in $A_{i,j}$ does not conflict with $a_\\ell$ and comes after it, so $s_t \\ge f_\\ell \\ge f_k$: none of them conflicts with $a_k$.' },
            { title: 'Conclusion', body: '$A\'$ is a valid optimal solution that contains $a_k$. So the greedy choice never leads us away from an optimal solution; the same argument applies to the rest by induction.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Activity selection visualizer',
          viz: 'activity',
          tasks: [
            'Play the example day: how many activities are chosen? Which chosen activity does each skipped one conflict with?',
            'Why do we choose the activity that **finishes first** rather than the **shortest** one? Try a few random sets of activities.',
            'In **prediction mode**, answer “is it chosen?” for every activity.',
          ],
          body: `Activities are sorted by finish time. The vertical line is the finish time of the last chosen activity: an activity that starts before that line conflicts.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'On the example day in the visualizer, how many activities does the greedy algorithm choose?',
              answer: 4,
              hint: 'The first one chosen is $a$ [1, 4).',
              explanation: '$a$ [1, 4), $d$ [5, 7), $h$ [8, 11), $k$ [12, 16): 4 activities. Our tests check that this is the best over all subsets.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Greedy-AS (notes, Algorithm 1)',
          code: ACTIVITY_CODE,
          body: `If the activities are sorted by finish time, one pass: **$O(n)$**. With sorting, $O(n \\log n)$. A dramatic gain over the $O(n^3)$ of DP.`,
        },
        {
          kind: 'formal',
          title: 'Scheduling: weighted completion time',
          box: 'formal',
          label: 'formal',
          body: `$n$ jobs share one resource; job $j$ has length $l_j$ and importance (weight) $w_j$. In an ordering, the **completion time** $c_j$ of $j$ is the sum of the lengths of the jobs up to and including it. The goal is to minimize $\\sum_j w_j c_j$.

**Exchange argument:** in an optimal order let $j$ follow $i$ directly, and swap them. The other jobs’ completion times do not change; $c_i$ grows by $l_j$ and $c_j$ shrinks by $l_i$. The objective changes by $w_i l_j - w_j l_i$. Since the order was optimal this change is $\\ge 0$:
$$w_i l_j \\ge w_j l_i \\iff \\frac{l_i}{w_i} \\le \\frac{l_j}{w_j}.$$
So jobs should be done in **increasing order of $l / w$**: short and important jobs first.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Two jobs: A ($l = 3$, $w = 1$) and B ($l = 1$, $w = 2$). What is $\\sum w_j c_j$ in the best order?',
              answer: 6,
              hint: 'Ratios: 3 for A, 0.5 for B.',
              explanation: 'B first: $c_B = 1$, $c_A = 4$ → $2 \\cdot 1 + 1 \\cdot 4 = 6$. The other order gives $1 \\cdot 3 + 2 \\cdot 4 = 11$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'The running time of greedy algorithms',
          body: `Most greedy algorithms follow the pattern “sort by a key, then one pass”: $O(n \\log n)$ (sorting) + $O(n)$. The real difficulty is not time but **correctness**: picking the wrong key (shortest activity, earliest start, weight alone…) easily gives a non-optimal result.

Example: choosing the **shortest** activity, on the input [0, 5), [4, 6), [5, 10), picks [4, 6) and excludes the other two: 1 activity, while the optimum is 2.`,
        },
        {
          kind: 'text',
          title: 'In practice',
          body: `- **Operating system schedulers:** “shortest job first” minimizes the average waiting time — the special case of the $l/w$ rule with equal weights.
- **Meeting room booking:** fitting as many meetings as possible into one room is activity selection; with several rooms, related greedy algorithms such as “interval partitioning” are used.
- **Making change:** in “canonical” coin systems such as the euro, starting with the largest coin is optimal, but in arbitrary systems (e.g. paying 6 with coins 1, 3, 4) it fails.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Coins are worth 1, 3 and 4 units. How many coins does the rule “start with the largest coin” use to pay 6 units?',
              answer: 3,
              hint: '4 + 1 + 1.',
              explanation: 'Greedy uses 4 + 1 + 1 = 3 coins, while 3 + 3 needs only 2. The greedy rule is not optimal here.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: wrong greedy rules',
          label: 'formal',
          body: `Instead of “earliest finish”, other reasonable-looking rules come to mind for activity selection. **A single counterexample** is enough to refute a greedy rule. (Intervals are $[s, f)$: one may start exactly when another ends.)`,
          proof: [
            { title: 'Earliest start', body: '$[0, 10)$, $[1, 2)$, $[3, 4)$: the rule picks $[0, 10)$ and the other two conflict with it → 1 activity. Optimal: $[1, 2)$ and $[3, 4)$ → 2.' },
            { title: 'Shortest first', body: '$[0, 5)$, $[4, 6)$, $[5, 10)$: the shortest one, $[4, 6)$, conflicts with both others → 1 activity. Optimal: $[0, 5)$ and $[5, 10)$ → 2.' },
            { title: 'Why is earliest finish different?', body: 'The exchange argument of Proposition 1: replacing the first activity of any optimal solution by the earliest-finishing one creates no conflict, because the earliest-finishing one ends no later. No such exchange works for the other rules.' },
            { title: 'The lesson', body: 'Before writing a greedy algorithm, either prove it (exchange argument) or compare it against brute force on small examples. Intuition alone misleads.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'For the activities $[0, 5)$, $[4, 6)$, $[5, 10)$, how many activities does the “shortest first” rule select?',
              answer: 1,
              hint: 'Which one is shortest, and what does it conflict with?',
              explanation: '$[4, 6)$ is picked; it conflicts with $[0, 5)$ and $[5, 10)$, so nothing else can be added. The optimum is 2.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Accepting a greedy rule without proof: working on a few examples is not enough.
- Forgetting to show, in the exchange argument, that the modified solution is **still valid**.
- Sorting activities by start time.
- Inverting the ratio in scheduling (increasing $w/l$ is wrong; increasing $l/w$, or decreasing $w/l$, is right).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Which greedy rule is always optimal for activity selection?',
          options: ['Choose the shortest activity', 'Choose the one that starts first', 'Choose the one that finishes first', 'Choose the one with fewest conflicts'],
          answer: 2,
          hint: 'Proposition 1.',
          explanation: 'The activity that finishes first leaves the most time for the rest; the exchange argument shows it is in some optimal solution.',
          feedback: { 0: 'It fails on the input [0,5), [4,6), [5,10).', 1: 'A very long activity that starts early can block everything.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'Three jobs of lengths 1, 2, 3 and equal weights (1) are done in the best order. What is $\\sum c_j$?',
          answer: 10,
          hint: 'Short job first.',
          explanation: '$1 + 3 + 6 = 10$ (the example in the notes). The reverse order gives $3 + 5 + 6 = 14$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'What is the purpose of an exchange argument?',
          options: [
            'To show that the greedy algorithm is fast.',
            'To show that any optimal solution can be changed, without getting worse, so that it contains the greedy choice.',
            'To list all solutions.',
            'To shrink the DP table.',
          ],
          answer: 1,
          hint: 'What did we do in the proof of Proposition 1?',
          explanation: 'We started from an optimal solution and replaced one element with the greedy choice; the solution stayed valid and kept its value.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'If the jobs are already sorted by $l/w$, how long does the weighted completion time problem take?',
          options: ['$O(1)$', '$O(n)$', '$O(n \\log n)$', '$O(n^2)$'],
          answer: 1,
          hint: 'All that is left is to add up in order.',
          explanation: 'Walking once through the sorted list and adding up completion times is $O(n)$; with sorting it is $O(n \\log n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: four jobs — P ($l = 4$, $w = 2$), Q ($l = 1$, $w = 1$), R ($l = 3$, $w = 3$), S ($l = 2$, $w = 1$). Find the best order and $\\sum w_j c_j$.`,
          hints: ['Ratios: P 2, Q 1, R 1, S 2.', 'The order of jobs with equal ratios does not change the result.'],
          solution: `Ratios $l/w$: Q 1, R 1, P 2, S 2. Order Q, R, P, S: completion times 1, 4, 8, 10 → $1 \\cdot 1 + 3 \\cdot 4 + 2 \\cdot 8 + 1 \\cdot 10 = 1 + 12 + 16 + 10 = 39$. (R, Q, P, S also gives 39: $3 \\cdot 3 + 1 \\cdot 4 + 16 + 10 = 39$.)`,
        },
        {
          id: 'p2',
          prompt: `Our own example: three jobs, (length $\\ell$, weight $w$): A (3, 1), B (1, 2), C (2, 2). Which order minimizes the weighted completion time $\\sum w_j c_j$? Find it without trying all 6 orders, then compare with a few.`,
          hints: ['The ratio rule: $\\ell / w$ from smallest to largest.', 'B: 0.5; C: 1; A: 3.'],
          solution: `Ratio order B, C, A. Completion times $c_B = 1$, $c_C = 3$, $c_A = 6$: $2 \\cdot 1 + 2 \\cdot 3 + 1 \\cdot 6 = 14$. Comparison: C, B, A → $2 \\cdot 2 + 2 \\cdot 3 + 1 \\cdot 6 = 16$; B, A, C → $2 \\cdot 1 + 1 \\cdot 4 + 2 \\cdot 6 = 18$; A, B, C → $1 \\cdot 3 + 2 \\cdot 4 + 2 \\cdot 6 = 23$. The best is 14, the order the ratio rule gives. Swapping two adjacent jobs only changes the contribution of those two; that is exactly where the exchange argument works.`,
        },
      ],
      sources: [SRC.l14.notes, SRC.l14.slides, SRC.l14.pre, SRC.l14.notebook, SRC.l14.concept],
    },
    {
      id: 'l14-huffman',
      lecture: 14,
      title: 'Huffman codes',
      titleEn: 'Huffman codes',
      summary: 'Prefix-free codes, code trees, and merging the two smallest frequencies.',
      minutes: 40,
      objectives: [
        'Explain why prefix-free codes are needed and how binary trees represent them.',
        'Compute the cost of a code as $B(T) = \\sum_c f(c)\\, d_T(c)$.',
        'Run Huffman’s algorithm step by step.',
        'Explain the two propositions of the correctness proof (the two rarest characters can be siblings; collapsing preserves optimality).',
      ],
      prerequisites: ['The greedy choice and exchange arguments', 'Binary trees'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: short codes for frequent letters',
          label: 'intuition',
          body: `ASCII gives every character a fixed 8 bits. But if “e” appears a lot in a text and “z” rarely, giving frequent characters short codes and rare ones long codes lowers the average length (in Morse code “e” is a single dot).

The problem: when codes are written one after another, how do we separate them? If a → 0, b → 1, c → 01, then “01” could be “ab” or “c”. The fix is **prefix-free** codes: no codeword is a prefix of another.`,
        },
        {
          kind: 'formal',
          title: 'Code trees and cost',
          box: 'formal',
          label: 'formal',
          body: `A prefix-free code can be drawn as a binary tree: the characters sit at the **leaves**; going left is 0, going right is 1; a character’s code is the path from the root to its leaf. Since no leaf is an ancestor of another, the code is prefix-free.

If $f(c)$ is the frequency of character $c$ ($\\sum f(c) = 1$) and $d_T(c)$ the depth of its leaf (the code length), the average number of bits is
$$B(T) = \\sum_{c} f(c)\\, d_T(c).$$
A tree minimizing $B(T)$ is **optimal**. An optimal tree is **full**: every internal node has two children (a node with one child could be removed, shortening codes).`,
        },
        {
          kind: 'pseudocode',
          title: 'Huffman (notes, Algorithm 2)',
          code: HUFFMAN_CODE,
          body: `David Huffman found this algorithm in 1951 at MIT, for the term paper he chose instead of the final exam. The idea: build subtrees from the bottom up, always merging the **two** trees of **smallest** total frequency.`,
        },
        {
          kind: 'viz',
          title: 'Huffman visualizer',
          viz: 'huffman',
          tasks: [
            'Play the algorithm with the notes’ frequencies: which two characters are merged first?',
            'In the final codes, which character gets 1 bit and which get 4 bits?',
            'Make all frequencies equal (e.g. a:1, b:1, c:1, d:1): what shape does the tree take?',
            'In **prediction mode**, guess one of the nodes merged at each step.',
          ],
          body: `The forest is drawn from left to right in order of frequency. The yellow node is the new internal node created in that step. At the end each leaf shows its code.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'With the notes’ frequencies (a 45, b 13, c 12, d 16, e 5, f 9; in percent), how many bits long is a Huffman codeword on average?',
              answer: 2.24,
              tolerance: 0.001,
              hint: 'a 1 bit; b, c, d 3 bits; e, f 4 bits.',
              explanation: '$0.45 \\cdot 1 + (0.13 + 0.12 + 0.16) \\cdot 3 + (0.05 + 0.09) \\cdot 4 = 2.24$ bits. A fixed-length code for 6 characters would need 3 bits.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Why optimal? (proof sketch)',
          label: 'proofIdea',
          proof: [
            { title: 'Hypothesis', body: 'After $t$ merges there is an optimal way to merge the subtrees we hold (current). At $t = 0$ this is obvious; at the end, with one tree left, it says the returned tree is optimal.' },
            { title: 'Proposition 2', body: 'Let $x$, $y$ be the two rarest characters. Some optimal tree has $x$ and $y$ as sibling leaves. Proof: swap them with the deepest sibling leaves $a$, $b$. Swapping $x$ and $a$ changes the cost by $(f(x) - f(a))(d_T(a) - d_T(x)) \\le 0$.' },
            { title: 'Proposition 3', body: 'Collapsing a subtree into one “character” whose frequency is the sum of its leaves does not break optimality: the cost difference depends only on the subtree’s own structure. So Proposition 2 also applies to newly created internal nodes.' },
            { title: 'Step', body: 'Together: merging the two smallest trees is consistent with an optimal way of merging. Full proof: CLRS Lemmas 16.2 and 16.3.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time',
          body: `$n - 1$ merges; each needs the two smallest trees. With a priority queue (a heap or a red-black tree) every operation is $O(\\log n)$: **$O(n \\log n)$** in total. If the frequencies are already sorted, it can be done in $O(n)$ with two queues.`,
        },
        {
          kind: 'text',
          title: 'In practice: compression',
          body: `- **ZIP / gzip (DEFLATE), PNG, JPEG and MP3** use Huffman coding (or a similar entropy code) as their last step.
- Since Huffman must give each character a whole number of bits, it may not reach the entropy exactly; **arithmetic coding** and **ANS** (Zstandard, modern image formats) close that gap.
- If one character is extremely frequent (say 99%), Huffman still spends at least 1 bit on it; then grouping characters or other methods are needed.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Which of the following codes is prefix-free?',
              options: ['a → 0, b → 01, c → 11', 'a → 0, b → 10, c → 11', 'a → 1, b → 10, c → 0', 'a → 00, b → 0, c → 1'],
              answer: 1,
              hint: 'Check whether any codeword is the beginning of another one.',
              explanation: '0, 10, 11: none is the beginning of another; they are the leaves of a tree. In the others 0 is a prefix of 01, 1 of 10, and 0 of 00.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: encoding and decoding',
          label: 'formal',
          body: `Let us use the code the visualizer builds for the frequencies in the notes (a 45, b 13, c 12, d 16, e 5, f 9): a → 0, c → 100, b → 101, d → 111, e → 1100, f → 1101.`,
          proof: [
            { title: 'Encoding', body: '“face” → 1101 · 0 · 100 · 1100 = 110101001100, 12 bits. A fixed 3-bit code also needs 12 bits: this word is made of rare letters. Huffman only wins **on average** (2.24 bits per character instead of 3); a single word can even be longer: “fee” takes 12 bits, 9 with the fixed code.' },
            { title: 'Decoding', body: 'Let us decode 0101100111: start at the root, go left (0) or right (1) on each bit; on reaching a leaf, write its letter and return to the root. 0 → a; 1, 0, 1 → b; 1, 0, 0 → c; 1, 1, 1 → d. The result is “abcd”.' },
            { title: 'Why is there no ambiguity?', body: 'The code is prefix-free, so the moment we reach a leaf no other codeword can continue along this path. No separator is needed and decoding takes $O(1)$ per bit.' },
            { title: 'A single bit error', body: 'If the first bit is read as 1 instead of 0: 1101100111 → 1101 · 100 · 111 = “fcd”. The error does not just change one letter; by shifting the parse it can corrupt everything after it. That is why compressed files carry a checksum (CRC-32 in gzip).' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Which word does 1001100111 decode to with this code?',
              options: ['ced', 'cfd', 'bed', 'acd'],
              answer: 0,
              hint: 'Start at the root: do 1, 0, 0 reach a leaf?',
              explanation: '100 → c, 1100 → e, 111 → d: “ced”.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Merging the two most frequent characters: the right ones are the two **rarest** trees (internal nodes included, not only characters).
- Forgetting the new internal node: in later steps it is a candidate tree too.
- Thinking code lengths are inversely proportional to frequencies: the relation is monotone, not proportional.
- Believing there is a single “correct” tree when frequencies tie: there can be several optimal trees, all with the same cost.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Which two trees does Huffman’s algorithm merge at each step?',
          options: ['The two with the largest frequency', 'The two with the smallest frequency', 'The two deepest', 'Two random ones'],
          answer: 1,
          hint: 'Rare characters should be deep.',
          explanation: 'The two smallest frequencies are merged; that way rare characters end up deep in the tree and frequent ones near the root.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'For three characters with frequencies a 50, b 25, c 25 (percent), how many bits long is a Huffman codeword on average?',
          answer: 1.5,
          tolerance: 0.001,
          hint: 'b and c are merged.',
          explanation: 'a → 1 bit, b and c → 2 bits: $0.5 \\cdot 1 + 0.5 \\cdot 2 = 1.5$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Where are the characters located in the tree of a prefix-free code?',
          options: ['At any node', 'Only at the leaves', 'Only at the root', 'Only at internal nodes'],
          answer: 1,
          hint: 'What if a character were an ancestor of another?',
          explanation: 'If one code is a prefix of another, the first character’s node is an ancestor of the second. With characters at the leaves that is impossible.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'How long does Huffman’s algorithm (with a priority queue) take on an alphabet of $n$ characters?',
          options: ['$O(n)$', '$O(n \\log n)$', '$O(n^2)$', '$O(2^n)$'],
          answer: 1,
          hint: '$n - 1$ merges, each a few queue operations.',
          explanation: 'Each merge does two ExtractMins and one Insert: $O(\\log n)$. Total $O(n \\log n)$.',
        },
        {
          id: 'q5',
          kind: 'numeric',
          prompt: 'Frequencies a: 8, b: 4, c: 2, d: 1, e: 1. How many bits in total does this 16-letter text take with a Huffman code?',
          answer: 30,
          hint: 'First d and e merge, then with c, then with b.',
          explanation: 'Depths a 1, b 2, c 3, d 4, e 4: $8 + 8 + 6 + 4 + 4 = 30$ bits. A fixed-length code (3 bits) would take 48 bits.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: build a Huffman code from the letter frequencies of the word “ABRACADABRA”. How many bits does the word take? How many would a fixed-length code need?`,
          hints: ['Counts: A 5, B 2, R 2, C 1, D 1.', 'The first merge is C with D.'],
          solution: `Counts A 5, B 2, R 2, C 1, D 1 (11 in total). Merges: C + D = 2; then the two smallest: B (2) and R (2) or CD (2) — there is a tie, e.g. B + R = 4; CD (2) + BR (4) = 6; A (5) + 6 = 11. Codes: A 1 bit, B/R/C/D 3 bits. Total $5 \\cdot 1 + (2 + 2 + 1 + 1) \\cdot 3 = 23$ bits. Check it in the visualizer with “A:5, B:2, R:2, C:1, D:1” (if ties break differently the codes may change, but the total is still 23 bits). A fixed-length code for 5 letters needs 3 bits: $11 \\cdot 3 = 33$ bits.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: four letters, all equally frequent (a, b, c, d: 5 each). Build the Huffman tree. Is the result better than a fixed-length code? What happens when all frequencies are equal and there are $2^k$ letters?`,
          hints: ['The first two merges: (a, b) and (c, d).', 'Equal frequencies give a balanced tree.'],
          solution: `a + b = 10, c + d = 10, then 10 + 10 = 20. Every letter sits at depth 2: a 2-bit code each, $20 \\cdot 2 = 40$ bits in total, the same as a fixed-length 2-bit code. With $2^k$ equally frequent letters Huffman builds a perfectly balanced tree and every letter gets $k$ bits: there is no gain. Huffman’s gain comes from **skewed** distributions (like a: 8, b: 4, … in the quiz); in information theory this corresponds to the entropy being smaller than $\\log_2(\\text{number of letters})$.`,
        },
      ],
      sources: [SRC.l14.notes, SRC.l14.slides, SRC.l14.notebook, SRC.l14.concept],
    },
  ],
}
